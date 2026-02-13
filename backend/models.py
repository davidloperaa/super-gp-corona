from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class CommissionType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    logo_url: Optional[str] = None
    primary_color: str = "#FF0000"
    secondary_color: str = "#00CED1"
    accent_color: str = "#E6007E"
    background_color: str = "#050505"
    hero_image_url: Optional[str] = None
    event_start_date: str = "20 de Febrero 2026"
    event_end_date: str = "22 de Febrero 2026"
    event_location: str = "Corona Club XP, Popayán"
    hero_title: str = "CAMPEONATO INTERLIGAS"
    hero_subtitle: str = "SUPER GP"
    hero_description: str = "Vive la emoción del motociclismo extremo"
    footer_text: str = "© 2026 Corona Club XP. Todos los derechos reservados."
    footer_email: str = "contacto@coronaclubxp.com"
    footer_phone: str = "+57 300 123 4567"
    footer_address: str = "Avenida Panamericana, Km 9 El Cofre"
    instagram_url: str = "https://instagram.com/coronaclubxp"
    facebook_url: str = "https://facebook.com/coronaclubxp"
    nav_links: List[Dict[str, str]] = [
        {"label": "Inicio", "path": "/"},
        {"label": "Categorías", "path": "/categorias"},
        {"label": "Calendario", "path": "/calendario"},
        {"label": "Inscripciones", "path": "/inscripcion"},
        {"label": "Galería", "path": "/galeria"},
        {"label": "Noticias", "path": "/noticias"},
    ]
    gallery_images: List[Dict[str, Any]] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class SettingsUpdate(BaseModel):
    key: str
    value: Any

class QRScanRequest(BaseModel):
    qr_data: str

class CheckInRequest(BaseModel):
    registration_id: str

# Platform Configuration (Super Admin)
class PlatformConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    platform_name: str = "Event Platform"
    commission_type: CommissionType = CommissionType.PERCENTAGE
    commission_value: float = 5.0  # 5% or 5000 COP depending on type
    mercadopago_access_token: Optional[str] = None
    mercadopago_public_key: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class PlatformConfigUpdate(BaseModel):
    commission_type: Optional[CommissionType] = None
    commission_value: Optional[float] = None
    mercadopago_access_token: Optional[str] = None
    mercadopago_public_key: Optional[str] = None

# Event MercadoPago Configuration (per event/client)
class EventMercadoPagoConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str = "default"
    mercadopago_access_token: str
    mercadopago_public_key: str
    business_name: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class EventMercadoPagoUpdate(BaseModel):
    mercadopago_access_token: Optional[str] = None
    mercadopago_public_key: Optional[str] = None
    business_name: Optional[str] = None

# Super Admin models
class SuperAdminLogin(BaseModel):
    email: EmailStr
    password: str

class SuperAdminCreate(BaseModel):
    email: EmailStr
    password: str
    secret_key: str  # Extra security for creating super admins

# Gallery Image
class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    url: str
    title: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now())
