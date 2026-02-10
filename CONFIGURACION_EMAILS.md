# ⚠️ IMPORTANTE: Configuración de Emails con Resend

## 🔍 SITUACIÓN ACTUAL

**Email de Prueba Enviado:** ✅ Exitoso
- **ID:** 92946a0c-ee4e-47c6-b9e0-64e93423cae7
- **Destinatario:** inscripcionescorona@gmail.com (email del dueño de la cuenta Resend)
- **Estado:** Entregado correctamente

## ⚠️ LIMITACIÓN DETECTADA

Resend con API key **sin dominio verificado** solo permite:
- ✅ Enviar emails a: inscripcionescorona@gmail.com (el email registrado en Resend)
- ❌ NO puede enviar a otros emails (davidlwwe@gmail.com, usuarios, etc.)

**Mensaje de error:**
```
"You can only send testing emails to your own email address. 
To send emails to other recipients, please verify a domain."
```

## 🎯 SOLUCIÓN: VERIFICAR DOMINIO EN RESEND

### Opción 1: Verificar Dominio Propio (RECOMENDADO)

**Requisitos:**
- Tener un dominio registrado (ej: coronaclubxp.com)
- Acceso al panel de DNS del dominio

**Pasos Detallados:**

#### 1. Agregar Dominio en Resend
```
1. Ir a: https://resend.com/domains
2. Login con la cuenta que tiene la API key
3. Click "Add Domain"
4. Escribir tu dominio: coronaclubxp.com
5. Click "Add"
```

#### 2. Configurar DNS
Resend te mostrará 3 registros que debes agregar:

**Registro SPF:**
```
Tipo: TXT
Name: @ (o tu dominio)
Value: v=spf1 include:resend.net ~all
TTL: 3600
```

**Registro DKIM:**
```
Tipo: TXT
Name: resend._domainkey (Resend te dará el nombre exacto)
Value: p=MIGfMA0GCSq... (Resend te dará el valor exacto)
TTL: 3600
```

**Registro DMARC:**
```
Tipo: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@coronaclubxp.com
TTL: 3600
```

#### 3. Verificar DNS (Herramientas)
```
Usar para verificar que los registros se agregaron:
- https://mxtoolbox.com/SuperTool.aspx
- https://dnschecker.org/

Nota: Puede tomar 5-30 minutos en propagarse
```

#### 4. Verificar en Resend
```
1. Volver a Resend dashboard
2. El status cambiará de "Pending" a "Verified" ✅
3. Puede tomar hasta 24 horas
```

#### 5. Actualizar Backend
En `/app/backend/server.py`, buscar la función `send_email`:

```python
# CAMBIAR DE:
payload = {
    "from": "onboarding@resend.dev",
    "to": [to],
    ...
}

# A:
payload = {
    "from": "inscripciones@coronaclubxp.com",  # Tu dominio verificado
    "to": [to],
    ...
}
```

Después reiniciar backend:
```bash
sudo supervisorctl restart backend
```

---

### Opción 2: Usar Subdominio de Resend (TEMPORAL)

Resend puede proporcionarte un subdominio temporal:

```
Formato: tu-proyecto.resend.dev
Ejemplo: corona-xp.resend.dev

Emails desde: inscripciones@corona-xp.resend.dev
```

**Pasos:**
1. Contactar soporte de Resend
2. Solicitar subdominio personalizado
3. Actualizar `from` en el código

**Limitación:** No se ve profesional, pero funciona sin configurar DNS

---

### Opción 3: Cambiar a Gmail SMTP (ALTERNATIVA)

Si no puedes verificar dominio ahora, usa Gmail:

**Ventajas:**
- ✅ Configuración en 5 minutos
- ✅ Envía a cualquier email
- ✅ No requiere dominio

**Desventajas:**
- ❌ Límite de 500 emails/día
- ❌ Puede ir a spam
- ❌ Requiere App Password de Google

**Implementación:**

1. **Crear App Password en Google:**
```
a) Ir a: https://myaccount.google.com/security
b) Activar "Verificación en 2 pasos"
c) Ir a: https://myaccount.google.com/apppasswords
d) Crear contraseña para "Aplicación personalizada"
e) Copiar la contraseña de 16 caracteres
```

2. **Actualizar .env:**
```bash
GMAIL_USER=inscripcionescorona@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

3. **Instalar dependencia:**
```bash
cd /app/backend
pip install secure-smtplib
pip freeze > requirements.txt
```

4. **Actualizar send_email en server.py:**
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to: str, subject: str, html: str, cc: Optional[str] = None):
    try:
        gmail_user = os.getenv('GMAIL_USER')
        gmail_password = os.getenv('GMAIL_APP_PASSWORD')
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"Super GP Corona XP <{gmail_user}>"
        msg['To'] = to
        if cc:
            msg['Cc'] = cc
        
        html_part = MIMEText(html, 'html')
        msg.attach(html_part)
        
        recipients = [to]
        if cc:
            recipients.append(cc)
        
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, recipients, msg.as_string())
        server.quit()
        
        logging.info(f"Email sent successfully to {to}")
        return True
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        return False
```

---

## 🎯 RECOMENDACIÓN INMEDIATA

**Para PROBAR AHORA mismo:**

1. **Opción Rápida - Gmail SMTP:**
   - ✅ Funciona en 5 minutos
   - ✅ Envía a cualquier email
   - ✅ Perfecto para pruebas
   - Implementación arriba

2. **Opción Profesional - Verificar Dominio:**
   - ✅ Mejor para producción
   - ✅ Sin límites
   - ⏱️ Toma 1-24 horas

**Para el evento del 20-22 de Febrero:**
- Si faltan más de 7 días → Verifica dominio en Resend
- Si faltan menos de 7 días → Usa Gmail SMTP por ahora

---

## 🧪 PRUEBA FINAL DEL SISTEMA

Una vez configurado el método de email que elijas:

```bash
# Hacer inscripción de prueba:
cd /app/backend
python3 test_email.py

# O hacer inscripción completa desde el sitio:
1. Ir a /inscripcion
2. Llenar con TU email
3. Usar cupón ESPECIAL50
4. Completar pago con tarjeta de prueba
5. Verificar email recibido con QR
```

---

## 📞 RESUMEN

- **Sistema de emails:** ✅ FUNCIONANDO (limitado a inscripcionescorona@gmail.com por ahora)
- **Solución:** Verificar dominio O usar Gmail SMTP
- **Deploy a Vercel:** Guía completa en `/app/DEPLOY_VERCEL_PASO_A_PASO.md`
- **Todo está listo:** Solo falta elegir método de email definitivo

¿Prefieres que implemente Gmail SMTP ahora para que funcione inmediatamente, o tienes un dominio que quieres verificar en Resend?
