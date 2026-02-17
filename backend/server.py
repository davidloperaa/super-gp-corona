from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from decimal import Decimal
import mercadopago
import requests
import hashlib
import base64
import shutil
import urllib.parse
from qr_service import generate_qr_code, verify_qr_code
from models import (
    SiteSettings, SettingsUpdate, QRScanRequest, CheckInRequest,
    PlatformConfig, PlatformConfigUpdate, EventMercadoPagoConfig, 
    EventMercadoPagoUpdate, SuperAdminLogin, SuperAdminCreate, 
    GalleryImage, CommissionType
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Super GP Corona XP 2026 API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

JWT_SECRET = os.getenv('JWT_SECRET', 'super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
SUPER_ADMIN_SECRET = os.getenv('SUPER_ADMIN_SECRET', 'platform-super-secret-2026')
MERCADOPAGO_ACCESS_TOKEN = os.getenv('MERCADOPAGO_ACCESS_TOKEN')
MERCADOPAGO_PUBLIC_KEY = os.getenv('MERCADOPAGO_PUBLIC_KEY')
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
EMAIL_FROM = os.getenv('EMAIL_FROM', 'inscripciones@coronaclubxp.com')
EMAIL_ADMIN = os.getenv('EMAIL_ADMIN', 'inscripcionescorona@gmail.com')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

# Helper functions for dynamic MercadoPago and Commission
async def get_event_mercadopago_config():
    """Get the event organizer's MercadoPago configuration"""
    config = await db.event_mercadopago.find_one({"event_id": "default"}, {"_id": 0})
    if config and config.get("mercadopago_access_token"):
        return config
    # Fallback to environment variables
    return {
        "mercadopago_access_token": MERCADOPAGO_ACCESS_TOKEN,
        "mercadopago_public_key": MERCADOPAGO_PUBLIC_KEY,
        "business_name": "Corona Club XP"
    }

async def get_platform_config():
    """Get the platform (super admin) configuration"""
    config = await db.platform_config.find_one({"_id": "config"}, {"_id": 0})
    if config:
        return config
    # Default config
    return {
        "commission_type": "percentage",
        "commission_value": 5.0,
        "mercadopago_access_token": MERCADOPAGO_ACCESS_TOKEN,
        "mercadopago_public_key": MERCADOPAGO_PUBLIC_KEY
    }

async def calculate_commission(base_amount: float) -> tuple:
    """Calculate platform commission based on configuration
    Returns: (commission_amount, net_to_event)
    """
    config = await get_platform_config()
    commission_type = config.get("commission_type", "percentage")
    commission_value = config.get("commission_value", 5.0)
    
    if commission_type == "percentage":
        commission = base_amount * (commission_value / 100)
    else:  # fixed
        commission = commission_value
    
    # Ensure commission doesn't exceed the payment
    commission = min(commission, base_amount)
    net_to_event = base_amount - commission
    
    return round(commission, 0), round(net_to_event, 0)

def verify_super_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify super admin JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "super_admin":
            raise HTTPException(status_code=403, detail="Acceso solo para Super Admin")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

CATEGORIAS = [
    "INFANTIL", "INFANTIL MINI", "115 2T Élite", "150 2T Élite", "115 2T Master",
    "115 2T Novatos", "150 2T Novatos", "115 2T Principiantes", "Categoría Libre",
    "Ax100 - NKD y Scooter Novatos", "Ax100 - NKD y Scooter Elite", "220 4T Novatos",
    "220 4T Élite", "Super Moto", "GP1 motos 4T hasta 160cc", "Crypton Original Novatos",
    "Disegraf Crypton Recreativa RPDD", "Boxer CT 100 Recreativa RPDD",
    "Nkd 125 / Tvs 125 4T Recreativa RPDD", "150cc 4T Stock Multimarca Recreativa RPDD",
    "200 4T Stock Multimarca No Slick Recreativa RPDD", "Libre pilotos afiliados liga del Cauca",
    "Alto Cilindraje mas de 300cc", "Karts", "Liquimoly Popayan Sin experiencia",
    "Liqui Moly Popayán con experiencia", "Fórmula Colombia Liquimoly motos carenadas",
    "Veloarena Infantil hasta 11 años", "Veloarena adultos libre cilindrada",
    "Motocross infantil hasta 11 años", "Motocross Adultos Libre cilindrada"
]

PRECIOS_BASE = {cat: 120000 for cat in CATEGORIAS}

class RegistrationCreate(BaseModel):
    nombre: str = Field(..., min_length=1)
    apellido: str = Field(..., min_length=1)
    cedula: str = Field(..., min_length=5)
    numero_competicion: str = Field(..., min_length=1)
    celular: str = Field(..., min_length=10)
    correo: EmailStr
    liga: Optional[str] = None
    categorias: List[str] = Field(..., min_items=1)
    codigo_cupon: Optional[str] = None

class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    apellido: str
    cedula: str
    numero_competicion: str
    celular: str
    correo: EmailStr
    liga: Optional[str] = None
    categorias: List[str]
    precio_base: float
    descuento: float = 0.0
    precio_final: float
    # Commission tracking
    comision_plataforma: float = 0.0
    neto_evento: float = 0.0
    codigo_cupon: Optional[str] = None
    estado_pago: str = "pendiente"
    mercadopago_payment_id: Optional[str] = None
    mercadopago_preference_id: Optional[str] = None
    qr_code: Optional[str] = None
    check_in: bool = False
    check_in_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    codigo: str
    tipo_descuento: int
    usos_maximos: Optional[int] = None
    usos_actuales: int = 0
    activo: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class News(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    contenido: str
    imagen_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminCreate(BaseModel):
    email: str
    password: str

class CouponCreate(BaseModel):
    codigo: str
    tipo_descuento: int
    usos_maximos: Optional[int] = None

class NewsCreate(BaseModel):
    titulo: str
    contenido: str
    imagen_url: Optional[str] = None

class CategoryPriceUpdate(BaseModel):
    categoria: str
    precio: float

class CategoryCreate(BaseModel):
    nombre: str
    precio: float

class CategoryUpdate(BaseModel):
    nombre: str
    precio: float

class ContentUpdate(BaseModel):
    key: str
    value: Any

async def get_category_prices():
    prices_doc = await db.category_prices.find_one({"_id": "prices"})
    if prices_doc:
        return prices_doc.get("prices", PRECIOS_BASE)
    return PRECIOS_BASE

async def get_categories_from_db():
    """Get categories from database, fallback to default CATEGORIAS"""
    categories_doc = await db.categories.find_one({"_id": "categories_list"})
    if categories_doc and categories_doc.get("categories"):
        return categories_doc.get("categories")
    # Initialize with default categories if not exists
    await db.categories.update_one(
        {"_id": "categories_list"},
        {"$set": {"categories": CATEGORIAS}},
        upsert=True
    )
    return CATEGORIAS

async def update_category_price(categoria: str, precio: float):
    prices = await get_category_prices()
    prices[categoria] = precio
    await db.category_prices.update_one(
        {"_id": "prices"},
        {"$set": {"prices": prices}},
        upsert=True
    )

def send_email(to: str, subject: str, html: str, cc: Optional[str] = None):
    try:
        if not RESEND_API_KEY:
            logging.error("RESEND_API_KEY not configured")
            return False
            
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Super GP Corona <coronaclubxp@vittalix.com>",
            "to": [to],
            "subject": subject,
            "html": html
        }
        
        if cc:
            payload["cc"] = [cc]
        
        logging.info(f"Sending email to {to} with subject: {subject}")
        
        response = requests.post(
            "https://api.resend.com/emails",
            json=payload,
            headers=headers
        )
        
        logging.info(f"Resend response status: {response.status_code}")
        logging.info(f"Resend response body: {response.text}")
        
        if response.status_code in [200, 201]:
            logging.info(f"Email sent successfully to {to}")
            return True
        else:
            logging.error(f"Failed to send email: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        return False

def generate_qr_url(registration_id: str, secret_key: str) -> str:
    """Generate a QR code URL using quickchart.io service (compatible with email clients)"""
    verification_hash = hashlib.sha256(
        f"{registration_id}{secret_key}".encode()
    ).hexdigest()[:16]
    qr_data = f"{registration_id}|{verification_hash}"
    encoded_data = urllib.parse.quote(qr_data)
    return f"https://quickchart.io/qr?text={encoded_data}&size=200&dark=000000&light=ffffff"

def generate_confirmation_email(registration: dict, qr_code: str = None) -> str:
    # Generate QR URL for email (quickchart.io is compatible with all email clients)
    qr_url = generate_qr_url(registration['id'], JWT_SECRET)
    
    categories_html = ''.join([f'<tr><td style="padding: 5px 10px; color: #333333; font-size: 14px;">• {cat}</td></tr>' for cat in registration['categorias']])
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
            <tr>
                <td align="center" style="padding: 20px 10px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #DC2626; padding: 30px 20px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">INSCRIPCIÓN CONFIRMADA</h1>
                                <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Campeonato Interligas Super GP Corona XP 2026</p>
                            </td>
                        </tr>
                        
                        <!-- Welcome -->
                        <tr>
                            <td style="padding: 30px 30px 20px 30px;">
                                <h2 style="margin: 0 0 15px 0; color: #DC2626; font-size: 22px;">¡Bienvenido al campeonato!</h2>
                                <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                                    Estimado/a <strong>{registration['nombre']} {registration['apellido']}</strong>,
                                </p>
                                <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.5;">
                                    Tu inscripción ha sido confirmada exitosamente para el Campeonato Interligas Super GP Corona XP 2026.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- QR Code Section -->
                        <tr>
                            <td style="padding: 0 30px 20px 30px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border: 2px dashed #10B981; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 25px; text-align: center;">
                                            <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: bold;">Tu Código QR de Acceso</h3>
                                            <img src="{qr_url}" alt="Código QR" width="200" height="200" style="display: block; margin: 0 auto; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                                            <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px;">Presenta este QR el día del evento para tu check-in</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Details Section -->
                        <tr>
                            <td style="padding: 0 30px 20px 30px;">
                                <h3 style="margin: 0 0 15px 0; color: #10B981; font-size: 18px; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Detalles de tu inscripción</h3>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                                            <strong style="color: #10B981;">ID de Inscripción:</strong>
                                            <span style="color: #333333; margin-left: 10px;">{registration['id']}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                                            <strong style="color: #10B981;">Número de Competición:</strong>
                                            <span style="color: #333333; margin-left: 10px; font-weight: bold; font-size: 18px;">#{registration['numero_competicion']}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                                            <strong style="color: #10B981;">Cédula:</strong>
                                            <span style="color: #333333; margin-left: 10px;">{registration['cedula']}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                                            <strong style="color: #10B981;">Categorías:</strong>
                                        </td>
                                    </tr>
                                    {categories_html}
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                                            <strong style="color: #10B981;">Precio Total:</strong>
                                            <span style="color: #333333; margin-left: 10px; font-weight: bold;">COP {registration['precio_final']:,.0f}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <strong style="color: #10B981;">Estado de Pago:</strong>
                                            <span style="color: #ffffff; margin-left: 10px; background-color: #10B981; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;">{registration['estado_pago'].upper()}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Event Info -->
                        <tr>
                            <td style="padding: 0 30px 20px 30px;">
                                <h3 style="margin: 0 0 15px 0; color: #10B981; font-size: 18px; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Información del Evento</h3>
                                <p style="margin: 0 0 8px 0; color: #333333; font-size: 15px;">
                                    <strong>Fechas:</strong> 27, 28 de Febrero y 1 de Marzo 2026
                                </p>
                                <p style="margin: 0; color: #333333; font-size: 15px;">
                                    <strong>Ubicación:</strong> Corona Club XP, Avenida Panamericana Km 9 El Cofre, Popayán
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Important Notice -->
                        <tr>
                            <td style="padding: 0 30px 20px 30px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #DC2626; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 15px 20px; text-align: center;">
                                            <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: bold;">
                                                ⚠️ IMPORTANTE: Lleva tu QR code impreso o en tu celular el día del evento
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Contact -->
                        <tr>
                            <td style="padding: 0 30px 30px 30px;">
                                <p style="margin: 0 0 15px 0; color: #333333; font-size: 14px;">
                                    Para cualquier consulta, contáctanos en <a href="mailto:inscripcionescorona@gmail.com" style="color: #10B981; text-decoration: none; font-weight: bold;">inscripcionescorona@gmail.com</a>
                                </p>
                                <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: bold;">
                                    ¡Nos vemos en la pista! 🏁
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #1a1a1a; padding: 20px 30px; text-align: center;">
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    © 2026 Corona Club XP - Campeonato Interligas Super GP
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

async def calculate_precio(categorias: List[str], codigo_cupon: Optional[str] = None) -> tuple:
    prices = await get_category_prices()
    precio_base = sum([prices.get(cat, 120000) for cat in categorias])
    descuento = 0.0
    tipo_descuento = 0
    
    fase_actual = "ordinaria"
    fecha_actual = datetime.now(timezone.utc)
    
    if fecha_actual.month == 1:
        fase_actual = "preventa"
        precio_base = precio_base * 0.85
    elif fecha_actual.month >= 3:
        fase_actual = "extraordinaria"
        precio_base = precio_base * 1.2
    
    if codigo_cupon:
        coupon = await db.coupons.find_one({"codigo": codigo_cupon.upper(), "activo": True})
        if coupon:
            tipo_descuento = coupon.get("tipo_descuento", 0)
            descuento = precio_base * (tipo_descuento / 100)
    
    precio_final = precio_base - descuento
    return precio_base, descuento, precio_final, fase_actual, tipo_descuento

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

@api_router.get("/")
async def root():
    return {"message": "API Super GP Corona XP 2026", "version": "2.0.0"}

@api_router.get("/test-email/{email}")
async def test_email(email: str):
    """Test endpoint to verify Resend is working"""
    test_html = """
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Prueba de Email - Super GP Corona XP</h1>
        <p>Este es un email de prueba para verificar que Resend está funcionando correctamente.</p>
        <p style="color: #10B981; font-weight: bold;">¡Si recibes este email, la configuración es correcta!</p>
    </div>
    """
    success = send_email(email, "Prueba - Super GP Corona XP 2026", test_html)
    
    if success:
        return {"status": "success", "message": f"Email de prueba enviado a {email}"}
    else:
        return {"status": "error", "message": "Error al enviar email. Revisa los logs del backend."}

@api_router.get("/mercadopago/public-key")
async def get_mercadopago_public_key():
    """Get the event's MercadoPago public key"""
    mp_config = await get_event_mercadopago_config()
    return {"public_key": mp_config.get("mercadopago_public_key", MERCADOPAGO_PUBLIC_KEY)}

@api_router.get("/categories")
async def get_categories():
    categories = await get_categories_from_db()
    prices = await get_category_prices()
    # Get category groups
    groups_doc = await db.category_groups.find_one({"_id": "groups"})
    groups = groups_doc.get("groups", {}) if groups_doc else {}
    return {"categorias": categories, "precios": prices, "grupos": groups}

@api_router.post("/registrations/calculate")
async def calculate_registration_price(data: dict):
    categorias = data.get("categorias", [])
    codigo_cupon = data.get("codigo_cupon")
    
    if not categorias:
        raise HTTPException(status_code=400, detail="Debe seleccionar al menos una categoría")
    
    precio_base, descuento, precio_final, fase, tipo_desc = await calculate_precio(categorias, codigo_cupon)
    
    return {
        "precio_base": precio_base,
        "descuento": descuento,
        "precio_final": precio_final,
        "fase_actual": fase,
        "tipo_descuento": tipo_desc
    }

@api_router.post("/registrations", response_model=Registration)
async def create_registration(reg: RegistrationCreate):
    precio_base, descuento, precio_final, fase, tipo_desc = await calculate_precio(reg.categorias, reg.codigo_cupon)
    
    # Calculate commission
    comision, neto_evento = await calculate_commission(precio_final)
    
    registration = Registration(
        nombre=reg.nombre,
        apellido=reg.apellido,
        cedula=reg.cedula,
        numero_competicion=reg.numero_competicion,
        celular=reg.celular,
        correo=reg.correo,
        liga=reg.liga,
        categorias=reg.categorias,
        precio_base=precio_base,
        descuento=descuento,
        precio_final=precio_final,
        comision_plataforma=comision,
        neto_evento=neto_evento,
        codigo_cupon=reg.codigo_cupon,
        estado_pago="pendiente" if precio_final > 0 else "completado"
    )
    
    qr_code = generate_qr_code(registration.id, JWT_SECRET)
    registration.qr_code = qr_code
    
    doc = registration.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('check_in_time'):
        doc['check_in_time'] = doc['check_in_time'].isoformat()
    
    await db.registrations.insert_one(doc)
    
    if reg.codigo_cupon and precio_final < precio_base:
        await db.coupons.update_one(
            {"codigo": reg.codigo_cupon.upper()},
            {"$inc": {"usos_actuales": 1}}
        )
    
    if precio_final == 0:
        email_html = generate_confirmation_email(doc, qr_code)
        send_email(reg.correo, "Confirmación de Inscripción - Super GP Corona XP 2026", email_html, EMAIL_ADMIN)
    
    return registration

@api_router.post("/payments/create-preference")
async def create_payment_preference(data: dict):
    registration_id = data.get("registration_id")
    
    reg = await db.registrations.find_one({"id": registration_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    if reg.get("precio_final", 0) == 0:
        raise HTTPException(status_code=400, detail="Esta inscripción no requiere pago")
    
    # Get dynamic MercadoPago configuration
    mp_config = await get_event_mercadopago_config()
    event_sdk = mercadopago.SDK(mp_config.get("mercadopago_access_token", MERCADOPAGO_ACCESS_TOKEN))
    
    preference_data = {
        "items": [
            {
                "title": f"Inscripción Super GP - {reg['nombre']} {reg['apellido']}",
                "quantity": 1,
                "currency_id": "COP",
                "unit_price": float(reg["precio_final"])
            }
        ],
        "payer": {
            "name": reg["nombre"],
            "surname": reg["apellido"],
            "email": reg["correo"],
            "phone": {
                "number": reg["celular"]
            }
        },
        "back_urls": {
            "success": f"{FRONTEND_URL}/pago-exitoso?registration_id={registration_id}",
            "failure": f"{FRONTEND_URL}/pago-fallido?registration_id={registration_id}",
            "pending": f"{FRONTEND_URL}/pago-exitoso?registration_id={registration_id}&status=pending"
        },
        "auto_return": "approved",
        "external_reference": registration_id,
        "statement_descriptor": "SUPER GP CORONA",
        "binary_mode": False,
        "notification_url": "https://corona-backend.dhvxzc.easypanel.host/api/webhooks/mercadopago"
    }
    
    try:
        preference_response = event_sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        await db.registrations.update_one(
            {"id": registration_id},
            {"$set": {"mercadopago_preference_id": preference["id"]}}
        )
        
        return {
            "preference_id": preference["id"],
            "init_point": preference["init_point"],
            "sandbox_init_point": preference.get("sandbox_init_point")
        }
    except Exception as e:
        logging.error(f"Error creating preference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear preferencia de pago: {str(e)}")

@api_router.post("/webhooks/mercadopago")
async def mercadopago_webhook(request: Request):
    try:
        data = await request.json()
        
        if data.get("type") == "payment":
            payment_id = data["data"]["id"]
            
            payment_info = sdk.payment().get(payment_id)
            payment = payment_info["response"]
            
            external_reference = payment.get("external_reference")
            status = payment.get("status")
            
            if external_reference and status == "approved":
                reg = await db.registrations.find_one({"id": external_reference})
                
                if reg:
                    await db.registrations.update_one(
                        {"id": external_reference},
                        {
                            "$set": {
                                "estado_pago": "completado",
                                "mercadopago_payment_id": str(payment_id)
                            }
                        }
                    )
                    
                    email_html = generate_confirmation_email(reg, reg.get('qr_code'))
                    send_email(reg["correo"], "Confirmación de Inscripción - Super GP Corona XP 2026", email_html, EMAIL_ADMIN)
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.post("/payments/verify/{registration_id}")
async def verify_payment(registration_id: str):
    """Verify payment status with MercadoPago and update registration"""
    try:
        reg = await db.registrations.find_one({"id": registration_id})
        if not reg:
            raise HTTPException(status_code=404, detail="Inscripción no encontrada")
        
        # If already completed, return current status
        if reg.get("estado_pago") == "completado":
            return {"status": "completed", "message": "Pago ya confirmado"}
        
        preference_id = reg.get("mercadopago_preference_id")
        if not preference_id:
            return {"status": "pending", "message": "Sin preferencia de pago"}
        
        # Search for payments with this external reference
        mp_config = await get_event_mercadopago_config()
        event_sdk = mercadopago.SDK(mp_config.get("mercadopago_access_token", MERCADOPAGO_ACCESS_TOKEN))
        
        # Search payments by external_reference
        search_result = event_sdk.payment().search({
            "external_reference": registration_id
        })
        
        payments = search_result.get("response", {}).get("results", [])
        
        for payment in payments:
            if payment.get("status") == "approved":
                # Update registration
                await db.registrations.update_one(
                    {"id": registration_id},
                    {
                        "$set": {
                            "estado_pago": "completado",
                            "mercadopago_payment_id": str(payment.get("id"))
                        }
                    }
                )
                
                # Send confirmation email
                updated_reg = await db.registrations.find_one({"id": registration_id}, {"_id": 0})
                email_html = generate_confirmation_email(updated_reg, updated_reg.get('qr_code'))
                send_email(updated_reg["correo"], "Confirmación de Inscripción - Super GP Corona XP 2026", email_html, EMAIL_ADMIN)
                
                return {"status": "completed", "message": "Pago confirmado exitosamente"}
        
        return {"status": "pending", "message": "Pago aún no confirmado"}
        
    except Exception as e:
        logging.error(f"Error verifying payment: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.put("/admin/registrations/{registration_id}/status")
async def update_registration_status(registration_id: str, data: dict, payload: dict = Depends(verify_token)):
    """Manually update registration payment status (admin only)"""
    new_status = data.get("estado_pago")
    if new_status not in ["pendiente", "completado"]:
        raise HTTPException(status_code=400, detail="Estado no válido")
    
    reg = await db.registrations.find_one({"id": registration_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    await db.registrations.update_one(
        {"id": registration_id},
        {"$set": {"estado_pago": new_status}}
    )
    
    # If marking as completed and email not sent, send it
    if new_status == "completado":
        updated_reg = await db.registrations.find_one({"id": registration_id}, {"_id": 0})
        email_html = generate_confirmation_email(updated_reg, updated_reg.get('qr_code'))
        send_email(updated_reg["correo"], "Confirmación de Inscripción - Super GP Corona XP 2026", email_html, EMAIL_ADMIN)
    
    return {"message": f"Estado actualizado a {new_status}"}

@api_router.get("/registrations")
async def get_registrations(payload: dict = Depends(verify_token)):
    registrations = await db.registrations.find({}, {"_id": 0}).to_list(1000)
    for reg in registrations:
        if isinstance(reg.get('created_at'), str):
            reg['created_at'] = datetime.fromisoformat(reg['created_at'])
    return {"registrations": registrations, "total": len(registrations)}

@api_router.get("/registrations/{registration_id}")
async def get_registration(registration_id: str):
    reg = await db.registrations.find_one({"id": registration_id}, {"_id": 0})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    if isinstance(reg.get('created_at'), str):
        reg['created_at'] = datetime.fromisoformat(reg['created_at'])
    return reg

@api_router.delete("/admin/registrations/{registration_id}")
async def delete_registration(registration_id: str, payload: dict = Depends(verify_token)):
    """Delete a single registration"""
    reg = await db.registrations.find_one({"id": registration_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    result = await db.registrations.delete_one({"id": registration_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Error al eliminar inscripción")
    
    return {"message": "Inscripción eliminada exitosamente", "id": registration_id}

@api_router.delete("/admin/registrations")
async def delete_all_registrations(payload: dict = Depends(verify_token)):
    """Delete all registrations - USE WITH CAUTION"""
    result = await db.registrations.delete_many({})
    return {
        "message": f"Se eliminaron {result.deleted_count} inscripciones",
        "deleted_count": result.deleted_count
    }

@api_router.delete("/admin/registrations/status/{status}")
async def delete_registrations_by_status(status: str, payload: dict = Depends(verify_token)):
    """Delete registrations by payment status (pendiente or completado)"""
    if status not in ["pendiente", "completado"]:
        raise HTTPException(status_code=400, detail="Estado no válido. Use 'pendiente' o 'completado'")
    
    result = await db.registrations.delete_many({"estado_pago": status})
    return {
        "message": f"Se eliminaron {result.deleted_count} inscripciones con estado '{status}'",
        "deleted_count": result.deleted_count
    }

@api_router.post("/coupons/validate")
async def validate_coupon(data: dict):
    codigo = data.get("codigo", "").upper()
    coupon = await db.coupons.find_one({"codigo": codigo, "activo": True}, {"_id": 0})
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no válido o inactivo")
    
    if coupon.get("usos_maximos") and coupon.get("usos_actuales", 0) >= coupon["usos_maximos"]:
        raise HTTPException(status_code=400, detail="Cupón agotado")
    
    return {"valido": True, "tipo_descuento": coupon["tipo_descuento"]}

@api_router.post("/admin/coupons")
async def create_coupon(coupon: CouponCreate, payload: dict = Depends(verify_token)):
    new_coupon = Coupon(
        codigo=coupon.codigo.upper(),
        tipo_descuento=coupon.tipo_descuento,
        usos_maximos=coupon.usos_maximos
    )
    
    doc = new_coupon.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.coupons.insert_one(doc)
    return new_coupon

@api_router.get("/admin/coupons")
async def get_coupons(payload: dict = Depends(verify_token)):
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(1000)
    return {"coupons": coupons}

@api_router.post("/admin/news")
async def create_news(news: NewsCreate, payload: dict = Depends(verify_token)):
    new_news = News(
        titulo=news.titulo,
        contenido=news.contenido,
        imagen_url=news.imagen_url
    )
    
    doc = new_news.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.news.insert_one(doc)
    return new_news

@api_router.get("/news")
async def get_news():
    news_list = await db.news.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for news in news_list:
        if isinstance(news.get('created_at'), str):
            news['created_at'] = datetime.fromisoformat(news['created_at'])
    return {"news": news_list}

@api_router.put("/admin/category-price")
async def update_price(update: CategoryPriceUpdate, payload: dict = Depends(verify_token)):
    # Get categories from database
    categories = await get_categories_from_db()
    if update.categoria not in categories:
        raise HTTPException(status_code=400, detail="Categoría no válida")
    
    await update_category_price(update.categoria, update.precio)
    return {"message": "Precio actualizado", "categoria": update.categoria, "precio": update.precio}

@api_router.get("/admin/category-prices")
async def get_admin_category_prices(payload: dict = Depends(verify_token)):
    prices = await get_category_prices()
    return {"prices": prices}

@api_router.get("/admin/categories")
async def get_admin_categories(payload: dict = Depends(verify_token)):
    """Get all categories with their prices for admin"""
    categories = await get_categories_from_db()
    prices = await get_category_prices()
    return {"categories": categories, "prices": prices}

@api_router.post("/admin/categories")
async def create_category(category: CategoryCreate, payload: dict = Depends(verify_token)):
    """Create a new category"""
    categories = await get_categories_from_db()
    
    if category.nombre in categories:
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    
    # Add to categories list
    categories.append(category.nombre)
    await db.categories.update_one(
        {"_id": "categories_list"},
        {"$set": {"categories": categories}},
        upsert=True
    )
    
    # Set the price
    await update_category_price(category.nombre, category.precio)
    
    return {"message": "Categoría creada exitosamente", "categoria": category.nombre}

@api_router.put("/admin/categories/{old_name}")
async def update_category(old_name: str, category: CategoryUpdate, payload: dict = Depends(verify_token)):
    """Update a category name and/or price"""
    categories = await get_categories_from_db()
    prices = await get_category_prices()
    
    if old_name not in categories:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Update category name if changed
    if old_name != category.nombre:
        if category.nombre in categories:
            raise HTTPException(status_code=400, detail="El nuevo nombre ya existe")
        
        # Replace old name with new name in categories list
        index = categories.index(old_name)
        categories[index] = category.nombre
        await db.categories.update_one(
            {"_id": "categories_list"},
            {"$set": {"categories": categories}},
            upsert=True
        )
        
        # Update price key
        if old_name in prices:
            del prices[old_name]
        prices[category.nombre] = category.precio
        await db.category_prices.update_one(
            {"_id": "prices"},
            {"$set": {"prices": prices}},
            upsert=True
        )
        
        # Update category name in groups
        groups_doc = await db.category_groups.find_one({"_id": "groups"})
        if groups_doc and groups_doc.get("groups"):
            groups = groups_doc["groups"]
            updated = False
            for group_name, group_cats in groups.items():
                if old_name in group_cats:
                    idx = group_cats.index(old_name)
                    group_cats[idx] = category.nombre
                    updated = True
            if updated:
                await db.category_groups.update_one(
                    {"_id": "groups"},
                    {"$set": {"groups": groups}},
                    upsert=True
                )
    else:
        # Just update price
        await update_category_price(category.nombre, category.precio)
    
    return {"message": "Categoría actualizada exitosamente", "categoria": category.nombre}

@api_router.delete("/admin/categories/{nombre}")
async def delete_category(nombre: str, payload: dict = Depends(verify_token)):
    """Delete a category"""
    categories = await get_categories_from_db()
    prices = await get_category_prices()
    
    if nombre not in categories:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Remove from categories list
    categories.remove(nombre)
    await db.categories.update_one(
        {"_id": "categories_list"},
        {"$set": {"categories": categories}},
        upsert=True
    )
    
    # Remove price
    if nombre in prices:
        del prices[nombre]
        await db.category_prices.update_one(
            {"_id": "prices"},
            {"$set": {"prices": prices}},
            upsert=True
        )
    
    # Remove from groups
    groups_doc = await db.category_groups.find_one({"_id": "groups"})
    if groups_doc and groups_doc.get("groups"):
        groups = groups_doc["groups"]
        updated = False
        for group_name, group_cats in groups.items():
            if nombre in group_cats:
                group_cats.remove(nombre)
                updated = True
        if updated:
            await db.category_groups.update_one(
                {"_id": "groups"},
                {"$set": {"groups": groups}},
                upsert=True
            )
    
    return {"message": "Categoría eliminada exitosamente"}

@api_router.put("/admin/category-groups")
async def update_category_groups(data: dict, payload: dict = Depends(verify_token)):
    """Update category groups"""
    groups = data.get("grupos", {})
    await db.category_groups.update_one(
        {"_id": "groups"},
        {"$set": {"groups": groups}},
        upsert=True
    )
    return {"message": "Grupos actualizados exitosamente", "grupos": groups}

@api_router.put("/admin/categories-bulk")
async def bulk_update_categories(data: dict, payload: dict = Depends(verify_token)):
    """Bulk update categories, prices and groups - replaces all existing data"""
    categorias = data.get("categorias", [])
    precios = data.get("precios", {})
    grupos = data.get("grupos", {})
    
    # Update categories list
    await db.categories.update_one(
        {"_id": "categories_list"},
        {"$set": {"categories": categorias}},
        upsert=True
    )
    
    # Update prices
    await db.category_prices.update_one(
        {"_id": "prices"},
        {"$set": {"prices": precios}},
        upsert=True
    )
    
    # Update groups
    await db.category_groups.update_one(
        {"_id": "groups"},
        {"$set": {"groups": grupos}},
        upsert=True
    )
    
    return {
        "message": "Categorías actualizadas exitosamente",
        "total_categorias": len(categorias),
        "total_grupos": len(grupos)
    }

@api_router.put("/admin/content")
async def update_content(update: ContentUpdate, payload: dict = Depends(verify_token)):
    await db.site_content.update_one(
        {"key": update.key},
        {"$set": {"value": update.value, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Contenido actualizado", "key": update.key}

@api_router.get("/content")
async def get_content():
    contents = await db.site_content.find({}, {"_id": 0}).to_list(100)
    return {"contents": {c["key"]: c["value"] for c in contents}}

# ==================== CALENDAR ENDPOINTS ====================

DEFAULT_CALENDAR = [
    {
        "id": "dia-1",
        "dia": "Jueves 27",
        "fecha": "27 de Febrero 2026",
        "actividades": [
            {"hora": "19:00", "titulo": "Aguapanelazo", "descripcion": "Recepción y acreditación de pilotos"}
        ]
    },
    {
        "id": "dia-2", 
        "dia": "Viernes 28",
        "fecha": "28 de Febrero 2026",
        "actividades": [
            {"hora": "09:00 - 18:00", "titulo": "Entrenamientos", "descripcion": "Sesión de entrenamientos libres todas las categorías"},
            {"hora": "19:00", "titulo": "Reconocimiento y Premiación 2025", "descripcion": "Reconocimiento y premiación Pilotos campeones y subcampeones"}
        ]
    },
    {
        "id": "dia-3",
        "dia": "Sábado 1",
        "fecha": "1 de Marzo 2026",
        "actividades": [
            {"hora": "08:00 - 17:00", "titulo": "CARRERAS", "descripcion": "Carreras - Todas las categorías"},
            {"hora": "18:00", "titulo": "Premiación", "descripcion": "Ceremonia de premiación y entrega de trofeos"}
        ]
    }
]

DEFAULT_DISCIPLINES = [
    {"id": "1", "nombre": "MOTOVELOCIDAD", "ubicacion": "Pista Principal"},
    {"id": "2", "nombre": "SUPERMOTO", "ubicacion": "Circuito Mixto"},
    {"id": "3", "nombre": "VELOTIERRA", "ubicacion": "Pista de Tierra"},
    {"id": "4", "nombre": "MOTOCROSS", "ubicacion": "Track Motocross"},
    {"id": "5", "nombre": "VELOARENA", "ubicacion": "Arena Indoor"},
    {"id": "6", "nombre": "KARTS", "ubicacion": "Kartodromo"}
]

@api_router.get("/calendar")
async def get_calendar():
    """Get calendar events and disciplines"""
    calendar_doc = await db.calendar.find_one({"_id": "calendar"}, {"_id": 0})
    if not calendar_doc:
        return {"eventos": DEFAULT_CALENDAR, "disciplinas": DEFAULT_DISCIPLINES}
    return {
        "eventos": calendar_doc.get("eventos", DEFAULT_CALENDAR),
        "disciplinas": calendar_doc.get("disciplinas", DEFAULT_DISCIPLINES)
    }

@api_router.put("/admin/calendar")
async def update_calendar(data: dict, payload: dict = Depends(verify_token)):
    """Update calendar events and disciplines"""
    update_data = {
        "eventos": data.get("eventos", []),
        "disciplinas": data.get("disciplinas", []),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.calendar.update_one(
        {"_id": "calendar"},
        {"$set": update_data},
        upsert=True
    )
    return {"message": "Calendario actualizado exitosamente"}

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    admin = await db.admins.find_one({"email": credentials.email}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not bcrypt.checkpw(credentials.password.encode(), admin["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_access_token({"email": admin["email"], "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}

@api_router.post("/admin/register")
async def admin_register(credentials: AdminCreate):
    existing = await db.admins.find_one({"email": credentials.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin ya existe")
    
    password_hash = bcrypt.hashpw(credentials.password.encode(), bcrypt.gensalt()).decode()
    
    admin_doc = {
        "id": str(uuid.uuid4()),
        "email": credentials.email,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.admins.insert_one(admin_doc)
    return {"message": "Admin creado exitosamente"}

@api_router.get("/settings")
async def get_settings():
    settings = await db.site_settings.find_one({"_id": "settings"}, {"_id": 0})
    if not settings:
        default_settings = SiteSettings().model_dump()
        return {"settings": default_settings}
    return {"settings": settings}

@api_router.put("/admin/settings")
async def update_settings(settings: SiteSettings, payload: dict = Depends(verify_token)):
    settings_dict = settings.model_dump()
    settings_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.site_settings.update_one(
        {"_id": "settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"message": "Configuración actualizada", "settings": settings_dict}

@api_router.post("/qr/scan")
async def scan_qr(request: QRScanRequest):
    is_valid, registration_id = verify_qr_code(request.qr_data, JWT_SECRET)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Código QR inválido")
    
    reg = await db.registrations.find_one({"id": registration_id}, {"_id": 0})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    return {
        "valid": True,
        "registration": reg,
        "can_check_in": not reg.get("check_in", False) and reg.get("estado_pago") == "completado"
    }

@api_router.post("/admin/check-in")
async def check_in_registration(request: CheckInRequest, payload: dict = Depends(verify_token)):
    reg = await db.registrations.find_one({"id": request.registration_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    if reg.get("check_in"):
        raise HTTPException(status_code=400, detail="Este piloto ya hizo check-in")
    
    if reg.get("estado_pago") != "completado":
        raise HTTPException(status_code=400, detail="El pago no está completado")
    
    await db.registrations.update_one(
        {"id": request.registration_id},
        {
            "$set": {
                "check_in": True,
                "check_in_time": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"message": "Check-in exitoso", "registration_id": request.registration_id}

@api_router.get("/admin/attendance")
async def get_attendance_stats(payload: dict = Depends(verify_token)):
    total_registrations = await db.registrations.count_documents({})
    completed_payments = await db.registrations.count_documents({"estado_pago": "completado"})
    checked_in = await db.registrations.count_documents({"check_in": True})
    
    checked_in_list = await db.registrations.find(
        {"check_in": True},
        {"_id": 0, "nombre": 1, "apellido": 1, "numero_competicion": 1, "check_in_time": 1, "categorias": 1}
    ).to_list(1000)
    
    return {
        "total_registrations": total_registrations,
        "completed_payments": completed_payments,
        "checked_in": checked_in,
        "attendance_rate": (checked_in / completed_payments * 100) if completed_payments > 0 else 0,
        "checked_in_list": checked_in_list
    }


@api_router.post("/admin/resend-email/{registration_id}")
async def resend_confirmation_email(registration_id: str, payload: dict = Depends(verify_token)):
    reg = await db.registrations.find_one({"id": registration_id}, {"_id": 0})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    email_html = generate_confirmation_email(reg, reg.get('qr_code'))
    success = send_email(reg["correo"], "Confirmación de Inscripción - Super GP Corona XP 2026", email_html, EMAIL_ADMIN)
    
    if success:
        return {"message": "Email reenviado exitosamente", "to": reg["correo"]}
    else:
        raise HTTPException(status_code=500, detail="Error al enviar email")

@api_router.get("/registration/{registration_id}/qr")
async def get_registration_qr(registration_id: str):
    reg = await db.registrations.find_one({"id": registration_id}, {"_id": 0})
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    if not reg.get("qr_code"):
        qr_code = generate_qr_code(registration_id, JWT_SECRET)
        await db.registrations.update_one(
            {"id": registration_id},
            {"$set": {"qr_code": qr_code}}
        )
        return {"qr_code": qr_code}
    
    return {"qr_code": reg["qr_code"]}


# ==================== SUPER ADMIN ENDPOINTS ====================

@api_router.post("/superadmin/login")
async def super_admin_login(credentials: SuperAdminLogin):
    """Login for Super Admin (Platform Owner)"""
    admin = await db.super_admins.find_one({"email": credentials.email}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not bcrypt.checkpw(credentials.password.encode(), admin["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_access_token({"email": admin["email"], "role": "super_admin"})
    return {"access_token": token, "token_type": "bearer", "role": "super_admin"}

@api_router.post("/superadmin/register")
async def super_admin_register(credentials: SuperAdminCreate):
    """Create a new Super Admin - requires secret key"""
    if credentials.secret_key != SUPER_ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Clave secreta inválida")
    
    existing = await db.super_admins.find_one({"email": credentials.email})
    if existing:
        raise HTTPException(status_code=400, detail="Super Admin ya existe")
    
    password_hash = bcrypt.hashpw(credentials.password.encode(), bcrypt.gensalt()).decode()
    
    admin_doc = {
        "id": str(uuid.uuid4()),
        "email": credentials.email,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.super_admins.insert_one(admin_doc)
    return {"message": "Super Admin creado exitosamente"}

@api_router.get("/superadmin/platform-config")
async def get_platform_config_endpoint(payload: dict = Depends(verify_super_admin_token)):
    """Get platform configuration (Super Admin only)"""
    config = await get_platform_config()
    # Mask sensitive data
    if config.get("mercadopago_access_token"):
        config["mercadopago_access_token_masked"] = "****" + config["mercadopago_access_token"][-4:]
        del config["mercadopago_access_token"]
    return {"config": config}

@api_router.put("/superadmin/platform-config")
async def update_platform_config(update: PlatformConfigUpdate, payload: dict = Depends(verify_super_admin_token)):
    """Update platform configuration (Super Admin only)"""
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.platform_config.update_one(
        {"_id": "config"},
        {"$set": update_dict},
        upsert=True
    )
    return {"message": "Configuración de plataforma actualizada"}

@api_router.get("/superadmin/event-mercadopago")
async def get_event_mp_config(payload: dict = Depends(verify_super_admin_token)):
    """Get event's MercadoPago configuration (Super Admin only)"""
    config = await get_event_mercadopago_config()
    # Mask sensitive data
    if config.get("mercadopago_access_token"):
        config["mercadopago_access_token_masked"] = "****" + config["mercadopago_access_token"][-4:]
        del config["mercadopago_access_token"]
    return {"config": config}

@api_router.put("/superadmin/event-mercadopago")
async def update_event_mp_config(update: EventMercadoPagoUpdate, payload: dict = Depends(verify_super_admin_token)):
    """Update event's MercadoPago configuration (Super Admin only)"""
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    update_dict["event_id"] = "default"
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.event_mercadopago.update_one(
        {"event_id": "default"},
        {"$set": update_dict},
        upsert=True
    )
    return {"message": "Configuración de MercadoPago del evento actualizada"}

@api_router.get("/superadmin/commission-stats")
async def get_commission_stats(payload: dict = Depends(verify_super_admin_token)):
    """Get commission statistics (Super Admin only)"""
    pipeline = [
        {"$match": {"estado_pago": "completado"}},
        {"$group": {
            "_id": None,
            "total_registrations": {"$sum": 1},
            "total_revenue": {"$sum": "$precio_final"},
            "total_commission": {"$sum": "$comision_plataforma"},
            "total_net_to_events": {"$sum": "$neto_evento"}
        }}
    ]
    
    result = await db.registrations.aggregate(pipeline).to_list(1)
    
    if result:
        stats = result[0]
        del stats["_id"]
    else:
        stats = {
            "total_registrations": 0,
            "total_revenue": 0,
            "total_commission": 0,
            "total_net_to_events": 0
        }
    
    config = await get_platform_config()
    stats["commission_type"] = config.get("commission_type", "percentage")
    stats["commission_value"] = config.get("commission_value", 5.0)
    
    return {"stats": stats}

@api_router.get("/superadmin/registrations")
async def get_all_registrations_super(payload: dict = Depends(verify_super_admin_token)):
    """Get all registrations with commission details (Super Admin only)"""
    registrations = await db.registrations.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return {"registrations": registrations, "total": len(registrations)}


# ==================== IMAGE UPLOAD ENDPOINTS ====================

@api_router.post("/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    image_type: str = Form("general"),
    payload: dict = Depends(verify_token)
):
    """Upload an image (logo, hero, gallery)"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{image_type}_{uuid.uuid4()}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    # Save file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar imagen: {str(e)}")
    
    # Return URL
    image_url = f"/uploads/{filename}"
    return {"url": image_url, "filename": filename, "type": image_type}

@api_router.delete("/admin/delete-image/{filename}")
async def delete_image(filename: str, payload: dict = Depends(verify_token)):
    """Delete an uploaded image"""
    filepath = UPLOADS_DIR / filename
    
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    try:
        filepath.unlink()
        return {"message": "Imagen eliminada", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar imagen: {str(e)}")


# ==================== GALLERY MANAGEMENT ENDPOINTS ====================

@api_router.get("/gallery")
async def get_gallery():
    """Get all gallery images"""
    settings = await db.site_settings.find_one({"_id": "settings"}, {"_id": 0})
    gallery = settings.get("gallery_images", []) if settings else []
    return {"images": gallery}

@api_router.post("/admin/gallery")
async def add_gallery_image(
    file: UploadFile = File(...),
    title: str = Form(None),
    payload: dict = Depends(verify_token)
):
    """Add an image to the gallery"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"gallery_{uuid.uuid4()}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    # Save file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar imagen: {str(e)}")
    
    # Create gallery image object
    image_url = f"/uploads/{filename}"
    
    # Get current gallery count for order
    settings = await db.site_settings.find_one({"_id": "settings"})
    current_gallery = settings.get("gallery_images", []) if settings else []
    order = len(current_gallery)
    
    new_image = {
        "id": str(uuid.uuid4()),
        "url": image_url,
        "title": title,
        "order": order,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Add to gallery
    await db.site_settings.update_one(
        {"_id": "settings"},
        {"$push": {"gallery_images": new_image}},
        upsert=True
    )
    
    return {"message": "Imagen agregada a la galería", "image": new_image}

@api_router.delete("/admin/gallery/{image_id}")
async def delete_gallery_image(image_id: str, payload: dict = Depends(verify_token)):
    """Remove an image from the gallery"""
    settings = await db.site_settings.find_one({"_id": "settings"})
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    
    gallery = settings.get("gallery_images", [])
    image_to_delete = None
    
    for img in gallery:
        if img.get("id") == image_id:
            image_to_delete = img
            break
    
    if not image_to_delete:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Delete file if it's a local upload
    if image_to_delete.get("url", "").startswith("/uploads/"):
        filename = image_to_delete["url"].split("/")[-1]
        filepath = UPLOADS_DIR / filename
        if filepath.exists():
            filepath.unlink()
    
    # Remove from gallery
    await db.site_settings.update_one(
        {"_id": "settings"},
        {"$pull": {"gallery_images": {"id": image_id}}}
    )
    
    return {"message": "Imagen eliminada de la galería"}

@api_router.put("/admin/gallery/reorder")
async def reorder_gallery(order: List[str], payload: dict = Depends(verify_token)):
    """Reorder gallery images"""
    settings = await db.site_settings.find_one({"_id": "settings"})
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    
    gallery = settings.get("gallery_images", [])
    
    # Create a map of id to image
    image_map = {img["id"]: img for img in gallery}
    
    # Reorder
    new_gallery = []
    for idx, image_id in enumerate(order):
        if image_id in image_map:
            img = image_map[image_id]
            img["order"] = idx
            new_gallery.append(img)
    
    # Add any images not in the order list at the end
    for img in gallery:
        if img["id"] not in order:
            img["order"] = len(new_gallery)
            new_gallery.append(img)
    
    await db.site_settings.update_one(
        {"_id": "settings"},
        {"$set": {"gallery_images": new_gallery}}
    )
    
    return {"message": "Galería reordenada", "gallery": new_gallery}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
