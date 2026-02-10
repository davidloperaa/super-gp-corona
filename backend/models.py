from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

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
    gallery_images: List[str] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class SettingsUpdate(BaseModel):
    key: str
    value: Any

class QRScanRequest(BaseModel):
    qr_data: str

class CheckInRequest(BaseModel):
    registration_id: str
