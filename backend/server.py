from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
from qr_service import generate_qr_code, verify_qr_code
from models import SiteSettings, SettingsUpdate, QRScanRequest, CheckInRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Super GP Corona XP 2026 API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.getenv('JWT_SECRET', 'super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
MERCADOPAGO_ACCESS_TOKEN = os.getenv('MERCADOPAGO_ACCESS_TOKEN')
MERCADOPAGO_PUBLIC_KEY = os.getenv('MERCADOPAGO_PUBLIC_KEY')
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
EMAIL_FROM = os.getenv('EMAIL_FROM', 'inscripciones@coronaclubxp.com')
EMAIL_ADMIN = os.getenv('EMAIL_ADMIN', 'inscripcionescorona@gmail.com')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

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
    categorias: List[str]
    precio_base: float
    descuento: float = 0.0
    precio_final: float
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

class ContentUpdate(BaseModel):
    key: str
    value: Any

async def get_category_prices():
    prices_doc = await db.category_prices.find_one({"_id": "prices"})
    if prices_doc:
        return prices_doc.get("prices", PRECIOS_BASE)
    return PRECIOS_BASE

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
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "onboarding@resend.dev",
            "to": [to],
            "subject": subject,
            "html": html
        }
        
        if cc:
            payload["cc"] = [cc]
        
        response = requests.post(
            "https://api.resend.com/emails",
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            logging.info(f"Email sent successfully to {to}")
            return True
        else:
            logging.error(f"Failed to send email: {response.text}")
            return False
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        return False

def generate_confirmation_email(registration: dict, qr_code: str = None) -> str:
    qr_section = ""
    if qr_code:
        qr_section = f"""
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: white; border: 3px dashed #00CED1;">
            <h3 style="color: #000; margin-bottom: 15px;">Tu Código QR de Acceso</h3>
            <img src="{qr_code}" alt="QR Code" style="max-width: 250px; height: auto;" />
            <p style="color: #666; font-size: 14px; margin-top: 10px;">Presenta este QR el día del evento para tu check-in</p>
        </div>
        """
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #050505; color: #EDEDED; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #FF0000; padding: 30px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 32px; }}
            .content {{ background: #121212; padding: 30px; border: 1px solid #333; }}
            .info-row {{ margin: 15px 0; padding: 10px; border-left: 3px solid #00CED1; }}
            .label {{ color: #00CED1; font-weight: bold; }}
            .footer {{ text-align: center; padding: 20px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏍️ INSCRIPCIÓN CONFIRMADA</h1>
                <p style="color: white;">Campeonato Interligas Super GP Corona XP 2026</p>
            </div>
            <div class="content">
                <h2 style="color: #FF0000;">¡Bienvenido al campeonato!</h2>
                <p>Estimado/a {registration['nombre']} {registration['apellido']},</p>
                <p>Tu inscripción ha sido confirmada exitosamente para el Campeonato Interligas Super GP Corona XP 2026.</p>
                
                {qr_section}
                
                <h3 style="color: #00CED1;">Detalles de tu inscripción:</h3>
                <div class="info-row">
                    <span class="label">ID de Inscripción:</span> {registration['id']}
                </div>
                <div class="info-row">
                    <span class="label">Número de Competición:</span> #{registration['numero_competicion']}
                </div>
                <div class="info-row">
                    <span class="label">Cédula:</span> {registration['cedula']}
                </div>
                <div class="info-row">
                    <span class="label">Categorías:</span><br>
                    {'<br>'.join(['• ' + cat for cat in registration['categorias']])}
                </div>
                <div class="info-row">
                    <span class="label">Precio Total:</span> COP {registration['precio_final']:,.0f}
                </div>
                <div class="info-row">
                    <span class="label">Estado de Pago:</span> {registration['estado_pago'].upper()}
                </div>
                
                <h3 style="color: #00CED1;">Información del Evento:</h3>
                <p><strong>📅 Fechas:</strong> 20, 21 y 22 de Febrero 2026</p>
                <p><strong>📍 Ubicación:</strong> Corona Club XP, Avenida Panamericana Km 9 El Cofre, Popayán</p>
                
                <div style="background: #FF0000; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <p style="margin: 0; color: white; font-weight: bold;">⚠️ IMPORTANTE: Lleva tu QR code impreso o en tu celular el día del evento</p>
                </div>
                
                <p style="margin-top: 30px;">Para cualquier consulta, contáctanos en <a href="mailto:inscripciones@coronaclubxp.com" style="color: #00CED1;">inscripciones@coronaclubxp.com</a></p>
                
                <p style="margin-top: 20px; color: #FF0000; font-weight: bold;">¡Nos vemos en la pista! 🏁</p>
            </div>
            <div class="footer">
                <p>© 2026 Corona Club XP - Campeonato Interligas Super GP</p>
            </div>
        </div>
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
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=24))
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

@api_router.get("/mercadopago/public-key")
async def get_mercadopago_public_key():
    return {"public_key": MERCADOPAGO_PUBLIC_KEY}

@api_router.get("/categories")
async def get_categories():
    prices = await get_category_prices()
    return {"categorias": CATEGORIAS, "precios": prices}

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
    
    registration = Registration(
        nombre=reg.nombre,
        apellido=reg.apellido,
        cedula=reg.cedula,
        numero_competicion=reg.numero_competicion,
        celular=reg.celular,
        correo=reg.correo,
        categorias=reg.categorias,
        precio_base=precio_base,
        descuento=descuento,
        precio_final=precio_final,
        codigo_cupon=reg.codigo_cupon,
        estado_pago="pendiente" if precio_final > 0 else "completado"
    )
    
    doc = registration.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.registrations.insert_one(doc)
    
    if reg.codigo_cupon and precio_final < precio_base:
        await db.coupons.update_one(
            {"codigo": reg.codigo_cupon.upper()},
            {"$inc": {"usos_actuales": 1}}
        )
    
    if precio_final == 0:
        email_html = generate_confirmation_email(doc)
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
            "pending": f"{FRONTEND_URL}/pago-pendiente?registration_id={registration_id}"
        },
        "auto_return": "approved",
        "external_reference": registration_id,
        "notification_url": f"{FRONTEND_URL}/api/webhooks/mercadopago"
    }
    
    try:
        preference_response = sdk.preference().create(preference_data)
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
                    
                    email_html = generate_confirmation_email(reg)
                    send_email(reg["correo"], "Confirmación de Inscripción - Super GP Corona XP 2026", email_html, EMAIL_ADMIN)
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

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
    if update.categoria not in CATEGORIAS:
        raise HTTPException(status_code=400, detail="Categoría no válida")
    
    await update_category_price(update.categoria, update.precio)
    return {"message": "Precio actualizado", "categoria": update.categoria, "precio": update.precio}

@api_router.get("/admin/category-prices")
async def get_admin_category_prices(payload: dict = Depends(verify_token)):
    prices = await get_category_prices()
    return {"prices": prices}

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
