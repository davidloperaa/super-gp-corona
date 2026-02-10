import qrcode
import io
import base64
import hashlib
from datetime import datetime, timezone

def generate_qr_code(registration_id: str, secret_key: str) -> str:
    """
    Genera un código QR único para una inscripción
    Retorna el QR en formato base64
    """
    verification_hash = hashlib.sha256(
        f"{registration_id}{secret_key}".encode()
    ).hexdigest()[:16]
    
    qr_data = f"{registration_id}|{verification_hash}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

def verify_qr_code(qr_data: str, secret_key: str) -> tuple:
    """
    Verifica la autenticidad de un código QR
    Retorna (es_valido, registration_id)
    """
    try:
        parts = qr_data.split('|')
        if len(parts) != 2:
            return False, None
        
        registration_id, provided_hash = parts
        
        expected_hash = hashlib.sha256(
            f"{registration_id}{secret_key}".encode()
        ).hexdigest()[:16]
        
        if provided_hash == expected_hash:
            return True, registration_id
        else:
            return False, None
    except Exception:
        return False, None
