# 🚀 Guía Completa de Deployment y Configuración
## Plataforma Super GP Corona XP 2026

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### ✅ Funcionalidades Implementadas:

1. **Sistema de Pagos MercadoPago** ✅
   - Integración completa en PRODUCCIÓN
   - Credenciales configuradas
   - Webhook funcional
   - ⚠️ **LISTO PARA PRUEBAS REALES**

2. **Sistema de Emails Resend** ✅
   - Emails automáticos de confirmación
   - QR code incluido
   - Reenvío manual disponible
   - ⚠️ **FUNCIONAL CON DOMINIO DE PRUEBA**

3. **Sistema de QR Codes** ✅
   - Generación automática
   - Verificación criptográfica
   - Check-in funcional

4. **CMS Completo** ✅
   - Configuración dinámica
   - Cambios en tiempo real
   - Panel admin completo

5. **Campo Liga Agregado** ✅
   - En formulario de inscripción
   - Backend actualizado
   - Base de datos lista

---

## 🧪 PRUEBAS DEL SISTEMA DE PAGOS

### ¿Puedes probarlo ahora?
**SÍ**, el sistema de pagos está completamente funcional y listo para pruebas.

### Cómo probar MercadoPago:

1. **Usar Tarjetas de Prueba (Recomendado para testing):**
   ```
   Tarjeta aprobada:
   - Número: 5031 7557 3453 0604
   - CVV: 123
   - Fecha: 11/25
   - Nombre: APRO
   
   Tarjeta rechazada:
   - Número: 5031 4332 1540 6351
   - CVV: 123
   - Fecha: 11/25
   - Nombre: OTHE
   ```

2. **Flujo de Prueba:**
   ```
   a) Ir a /inscripcion
   b) Llenar formulario completo
   c) Seleccionar categorías
   d) Aplicar cupón (opcional)
   e) Click en "Confirmar Inscripción"
   f) Serás redirigido a MercadoPago
   g) Usar tarjeta de prueba
   h) Completar pago
   i) Verificar email de confirmación
   ```

3. **Verificar Resultados:**
   - Email recibido con QR
   - Dashboard admin actualizado
   - Estado de pago: "completado"

⚠️ **IMPORTANTE:** Estás usando credenciales de PRODUCCIÓN, así que también puedes hacer pagos reales con tarjetas reales.

---

## 🌐 RECOMENDACIONES DE HOSTING

### Opción 1: **Vercel + MongoDB Atlas** (Recomendado)
**Por qué:**
- ✅ Fácil deployment desde Git
- ✅ HTTPS automático
- ✅ Dominio personalizado gratis
- ✅ Escalable automáticamente
- ✅ Plan gratuito generoso

**Frontend (Vercel):**
```bash
1. Conectar repositorio Git
2. Framework: React
3. Build Command: cd frontend && yarn build
4. Output Directory: frontend/build
5. Variables de entorno:
   - REACT_APP_BACKEND_URL=https://tu-backend.vercel.app
```

**Backend (Vercel Serverless):**
```bash
1. Crear vercel.json en /backend:
{
  "builds": [{ "src": "server.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "server.py" }]
}

2. Variables de entorno en Vercel:
   - MONGO_URL
   - DB_NAME
   - MERCADOPAGO_ACCESS_TOKEN
   - MERCADOPAGO_PUBLIC_KEY
   - RESEND_API_KEY
   - JWT_SECRET
   - EMAIL_FROM
   - EMAIL_ADMIN
   - FRONTEND_URL
```

**Base de Datos (MongoDB Atlas):**
```
1. Crear cluster gratuito: https://www.mongodb.com/cloud/atlas
2. Whitelist IPs: 0.0.0.0/0 (para Vercel)
3. Copiar connection string
4. Agregar a variables de entorno
```

**Costo:** $0 (hasta 100GB bandwidth/mes)

---

### Opción 2: **Railway** (Más fácil)
**Por qué:**
- ✅ Un solo lugar para todo
- ✅ MongoDB incluido
- ✅ Deploy automático desde Git
- ✅ SSL automático

**Pasos:**
```bash
1. Crear cuenta: https://railway.app
2. New Project → Deploy from GitHub
3. Agregar MongoDB desde Marketplace
4. Agregar variables de entorno
5. Deploy automático
```

**Costo:** $5/mes después de trial

---

### Opción 3: **DigitalOcean App Platform**
**Por qué:**
- ✅ Infraestructura robusta
- ✅ Certificado SSL automático
- ✅ Base de datos managed

**Pasos:**
```bash
1. Crear App desde repositorio Git
2. Detecta automáticamente React + Python
3. Agregar MongoDB Managed Database
4. Configurar variables de entorno
5. Deploy
```

**Costo:** $12/mes (tier básico)

---

### Opción 4: **AWS (Producción seria)**
**Componentes:**
- Frontend: S3 + CloudFront
- Backend: ECS o Lambda
- Base de datos: DocumentDB o MongoDB Atlas
- Emails: SES (Simple Email Service)

**Costo:** ~$20-50/mes

---

## 📧 CONFIGURACIÓN DE EMAILS

### Problema Actual:
Estás usando el dominio de prueba de Resend (`onboarding@resend.dev`), que funciona pero tiene limitaciones.

### Solución 1: **Dominio Verificado en Resend** (Recomendado)

**Pasos:**
```bash
1. Ir a Resend Dashboard: https://resend.com/domains
2. Agregar tu dominio: coronaclubxp.com
3. Configurar registros DNS:
   - SPF: v=spf1 include:resend.net ~all
   - DKIM: (proporcionado por Resend)
   - DMARC: v=DMARC1; p=none; rua=mailto:dmarc@coronaclubxp.com

4. Esperar verificación (5-30 minutos)

5. Actualizar en código:
   En /app/backend/server.py cambiar:
   "from": "onboarding@resend.dev"
   Por:
   "from": "inscripciones@coronaclubxp.com"
```

**Beneficios:**
- ✅ Sin límites de envío
- ✅ Mejor deliverability
- ✅ Branding profesional
- ✅ No va a spam

**Costo:** $0 (incluido en Resend)

---

### Solución 2: **Gmail SMTP** (Backup)

**Configuración:**
```python
# Instalar: pip install python-dotenv smtplib

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_gmail(to, subject, html):
    gmail_user = os.getenv('GMAIL_USER')
    gmail_password = os.getenv('GMAIL_APP_PASSWORD')
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = gmail_user
    msg['To'] = to
    
    html_part = MIMEText(html, 'html')
    msg.attach(html_part)
    
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, to, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False
```

**Obtener App Password:**
```
1. Ir a: https://myaccount.google.com/security
2. Activar verificación en 2 pasos
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear password para "Aplicación personalizada"
5. Copiar y guardar en .env
```

**Límites:** 500 emails/día

---

## 🔄 SISTEMA DE REENVÍO DE EMAILS

### Ya Implementado:
El sistema ya tiene un endpoint para reenviar emails cuando fallan.

**Endpoint:**
```
POST /api/admin/resend-email/{registration_id}
Authorization: Bearer {admin_token}
```

**Cómo usar desde el Admin:**

1. **Opción A: Agregar botón en Admin Registrations:**
```javascript
// En AdminRegistrations.js, agregar columna:
<button
  onClick={() => handleResendEmail(reg.id)}
  className="text-secondary hover:text-secondary/80"
>
  Reenviar Email
</button>

// Función:
const handleResendEmail = async (id) => {
  const token = localStorage.getItem('admin_token');
  try {
    await axios.post(
      `${API}/admin/resend-email/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Email reenviado exitosamente');
  } catch (error) {
    alert('Error al reenviar email');
  }
};
```

2. **Opción B: Sistema automático de reintentos:**
```python
# En server.py, modificar send_email:
def send_email_with_retry(to, subject, html, cc=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            success = send_email(to, subject, html, cc)
            if success:
                return True
            time.sleep(2 ** attempt)  # Exponential backoff
        except Exception as e:
            logging.error(f"Intento {attempt + 1} falló: {str(e)}")
            if attempt == max_retries - 1:
                # Guardar en cola de reintentos
                await db.failed_emails.insert_one({
                    "to": to,
                    "subject": subject,
                    "html": html,
                    "cc": cc,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "retries": 0
                })
    return False
```

3. **Opción C: Cron job para emails fallidos:**
```python
# Agregar endpoint para procesar cola:
@api_router.post("/admin/process-failed-emails")
async def process_failed_emails(payload: dict = Depends(verify_token)):
    failed_emails = await db.failed_emails.find(
        {"retries": {"$lt": 5}}
    ).to_list(100)
    
    success_count = 0
    for email in failed_emails:
        success = send_email(
            email["to"],
            email["subject"],
            email["html"],
            email.get("cc")
        )
        
        if success:
            await db.failed_emails.delete_one({"_id": email["_id"]})
            success_count += 1
        else:
            await db.failed_emails.update_one(
                {"_id": email["_id"]},
                {"$inc": {"retries": 1}}
            )
    
    return {"processed": len(failed_emails), "success": success_count}
```

**Llamar con cron (desde servidor):**
```bash
# Cada hora:
0 * * * * curl -X POST https://tu-backend.com/api/admin/process-failed-emails \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔐 VARIABLES DE ENTORNO PARA PRODUCCIÓN

**Backend (.env):**
```bash
# Base de datos
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=supergp_production

# MercadoPago (YA CONFIGURADO)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3036384607288277-112109-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-6d930a25-840c-4da0-9627-...

# Resend (ACTUALIZAR CON DOMINIO VERIFICADO)
RESEND_API_KEY=re_TX9cFVwg_9FW31Dgr2wy733MRLwfzXfvN
EMAIL_FROM=inscripciones@coronaclubxp.com
EMAIL_ADMIN=inscripcionescorona@gmail.com

# Seguridad
JWT_SECRET=tu-secret-super-seguro-aqui-cambiar
CORS_ORIGINS=https://coronaclubxp.com,https://www.coronaclubxp.com

# Frontend URL
FRONTEND_URL=https://coronaclubxp.com
```

**Frontend (.env):**
```bash
REACT_APP_BACKEND_URL=https://api.coronaclubxp.com
```

---

## 📝 CHECKLIST DE DEPLOYMENT

### Pre-deployment:
- [ ] Dominio registrado y configurado
- [ ] MongoDB Atlas configurado
- [ ] Resend con dominio verificado
- [ ] Variables de entorno configuradas
- [ ] Backup de base de datos creado

### Deployment:
- [ ] Código en repositorio Git
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verificar HTTPS activo
- [ ] Probar endpoints principales

### Post-deployment:
- [ ] Crear admin de prueba
- [ ] Hacer inscripción de prueba
- [ ] Verificar pago de prueba
- [ ] Verificar email recibido
- [ ] Probar QR check-in
- [ ] Configurar monitoreo

### Monitoreo:
- [ ] Configurar alertas de errores
- [ ] Dashboard de métricas
- [ ] Backups automáticos
- [ ] Logs centralizados

---

## 🚨 RECOMENDACIONES DE SEGURIDAD

1. **JWT_SECRET:** Cambiar a un valor aleatorio fuerte
2. **CORS:** Restringir a tu dominio específico
3. **Rate Limiting:** Implementar límites de requests
4. **Backups:** Automáticos diarios de MongoDB
5. **SSL:** Verificar certificado válido
6. **Webhooks:** Validar signatures de MercadoPago

---

## 📞 SOPORTE Y MONITOREO

### Servicios Recomendados:

**Monitoreo de Uptime:**
- UptimeRobot (gratuito)
- Pingdom

**Logs y Errores:**
- Sentry (errores frontend/backend)
- LogDNA o Papertrail

**Métricas:**
- Google Analytics
- Mixpanel (eventos custom)

---

## 🎯 RESUMEN EJECUTIVO

### ¿Puedes probar pagos ahora?
✅ **SÍ** - Sistema 100% funcional con MercadoPago en producción

### ¿Dónde hospedar?
🥇 **Vercel + MongoDB Atlas** (Más recomendado - Gratis)
🥈 **Railway** (Más fácil - $5/mes)
🥉 **DigitalOcean** (Más robusto - $12/mes)

### ¿Cómo configurar emails?
1. Verificar dominio en Resend (5 minutos)
2. Actualizar DNS (TXT records)
3. Cambiar "from" en código
4. ✅ Listo - sin límites

### ¿Sistema de reenvío?
✅ **Ya implementado** - Endpoint `/admin/resend-email/{id}` disponible

---

**¿Necesitas ayuda con el deployment? Puedo guiarte paso a paso en cualquiera de las opciones.**
