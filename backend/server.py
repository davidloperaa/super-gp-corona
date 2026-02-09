from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from decimal import Decimal
import mercadopago

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

PRECIOS_BASE = {
    "INFANTIL": 50000, "INFANTIL MINI": 50000, "115 2T Élite": 80000, "150 2T Élite": 90000,
    "115 2T Master": 85000, "115 2T Novatos": 70000, "150 2T Novatos": 75000,
    "115 2T Principiantes": 65000, "Categoría Libre": 100000, "Ax100 - NKD y Scooter Novatos": 60000,
    "Ax100 - NKD y Scooter Elite": 75000, "220 4T Novatos": 80000, "220 4T Élite": 95000,
    "Super Moto": 120000, "GP1 motos 4T hasta 160cc": 90000, "Crypton Original Novatos": 65000,
    "Disegraf Crypton Recreativa RPDD": 70000, "Boxer CT 100 Recreativa RPDD": 70000,
    "Nkd 125 / Tvs 125 4T Recreativa RPDD": 75000, "150cc 4T Stock Multimarca Recreativa RPDD": 80000,
    "200 4T Stock Multimarca No Slick Recreativa RPDD": 85000, "Libre pilotos afiliados liga del Cauca": 110000,
    "Alto Cilindraje mas de 300cc": 150000, "Karts": 100000, "Liquimoly Popayan Sin experiencia": 80000,
    "Liqui Moly Popayán con experiencia": 95000, "Fórmula Colombia Liquimoly motos carenadas": 120000,
    "Veloarena Infantil hasta 11 años": 55000, "Veloarena adultos libre cilindrada": 90000,
    "Motocross infantil hasta 11 años": 60000, "Motocross Adultos Libre cilindrada": 100000
}

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

def calculate_precio(categorias: List[str], codigo_cupon: Optional[str] = None) -> tuple:
    precio_base = sum([PRECIOS_BASE.get(cat, 80000) for cat in categorias])
    descuento = 0.0
    
    fase_actual = "ordinaria"
    fecha_actual = datetime.now(timezone.utc)
    
    if fecha_actual.month == 1:
        fase_actual = "preventa"
        precio_base = precio_base * 0.85
    elif fecha_actual.month >= 3:
        fase_actual = "extraordinaria"
        precio_base = precio_base * 1.2
    
    if codigo_cupon:
        descuento = precio_base * 0.5
    
    precio_final = precio_base - descuento
    return precio_base, descuento, precio_final, fase_actual

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
    return {"message": "API Super GP Corona XP 2026", "version": "1.0.0"}

@api_router.get("/categories")
async def get_categories():
    return {"categorias": CATEGORIAS, "precios": PRECIOS_BASE}

@api_router.post("/registrations/calculate")
async def calculate_registration_price(data: dict):
    categorias = data.get("categorias", [])
    codigo_cupon = data.get("codigo_cupon")
    
    if not categorias:
        raise HTTPException(status_code=400, detail="Debe seleccionar al menos una categoría")
    
    precio_base, descuento, precio_final, fase = calculate_precio(categorias, codigo_cupon)
    
    return {
        "precio_base": precio_base,
        "descuento": descuento,
        "precio_final": precio_final,
        "fase_actual": fase
    }

@api_router.post("/registrations", response_model=Registration)
async def create_registration(reg: RegistrationCreate):
    precio_base, descuento, precio_final, fase = calculate_precio(reg.categorias, reg.codigo_cupon)
    
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
        codigo_cupon=reg.codigo_cupon
    )
    
    doc = registration.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.registrations.insert_one(doc)
    
    if reg.codigo_cupon:
        await db.coupons.update_one(
            {"codigo": reg.codigo_cupon},
            {"$inc": {"usos_actuales": 1}}
        )
    
    return registration

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
