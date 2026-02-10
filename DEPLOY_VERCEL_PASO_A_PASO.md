# 🚀 GUÍA PASO A PASO: DEPLOY A VERCEL
## Plataforma Super GP Corona XP 2026

---

## 📋 PREREQUISITOS

Antes de comenzar, necesitas:
- ✅ Cuenta en Vercel (gratis): https://vercel.com/signup
- ✅ Cuenta en MongoDB Atlas (gratis): https://www.mongodb.com/cloud/atlas/register
- ✅ Cuenta en GitHub (para conectar el código)
- ✅ Este código del proyecto

---

## PASO 1: CREAR CUENTA EN MONGODB ATLAS

### 1.1 Registro
```
1. Ir a: https://www.mongodb.com/cloud/atlas/register
2. Registrarse con Google o email
3. Crear organización (nombre: "Super GP" o similar)
4. Crear proyecto (nombre: "corona-xp-2026")
```

### 1.2 Crear Cluster Gratuito
```
1. Click en "Build a Database"
2. Seleccionar: "M0 Sandbox" (FREE)
3. Provider: AWS
4. Region: us-east-1 (o la más cercana a Colombia)
5. Cluster Name: "cluster-supergp"
6. Click "Create"
```

### 1.3 Configurar Acceso
```
1. Database Access (Crear usuario):
   - Username: supergp_admin
   - Password: (generar automático y GUARDAR)
   - Role: Atlas admin
   - Click "Add User"

2. Network Access (Whitelist IP):
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Confirmar: 0.0.0.0/0
   - Click "Confirm"
```

### 1.4 Obtener Connection String
```
1. Click en "Connect" en tu cluster
2. Seleccionar "Connect your application"
3. Driver: Python, Version: 3.12 or later
4. Copiar el connection string:
   mongodb+srv://supergp_admin:<password>@cluster-supergp.xxxxx.mongodb.net/?retryWrites=true&w=majority

5. IMPORTANTE: Reemplazar <password> con tu password real
6. GUARDAR este string - lo necesitarás después
```

---

## PASO 2: SUBIR CÓDIGO A GITHUB

### Opción A: Usar GitHub Desktop (Más Fácil)

```
1. Descargar GitHub Desktop: https://desktop.github.com/
2. Instalar y hacer login
3. File → New Repository
   - Name: corona-xp-2026
   - Local Path: seleccionar carpeta /app
   - Click "Create Repository"
4. Commit changes (arriba a la izquierda)
5. Publish repository (botón azul)
   - Desmarcar "Keep this code private" si quieres público
   - Click "Publish Repository"
```

### Opción B: Usando Git Command Line

```bash
cd /app

# Inicializar repositorio
git init

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: Super GP Corona XP 2026"

# Crear repositorio en GitHub (desde el navegador)
# Ir a: https://github.com/new
# Name: corona-xp-2026
# Click "Create repository"

# Conectar y subir
git remote add origin https://github.com/TU-USUARIO/corona-xp-2026.git
git branch -M main
git push -u origin main
```

---

## PASO 3: DEPLOY BACKEND EN VERCEL

### 3.1 Crear Cuenta en Vercel
```
1. Ir a: https://vercel.com/signup
2. Registrarse con GitHub (recomendado)
3. Autorizar acceso a repositorios
```

### 3.2 Importar Proyecto
```
1. Click "Add New..." → "Project"
2. Seleccionar repositorio: corona-xp-2026
3. Click "Import"
```

### 3.3 Configurar Backend
```
Framework Preset: Other
Root Directory: backend
Build Command: (dejar vacío)
Output Directory: (dejar vacío)
Install Command: pip install -r requirements_vercel.txt
```

### 3.4 Agregar Variables de Entorno
```
Click "Environment Variables" y agregar TODAS estas:

MONGO_URL=mongodb+srv://supergp_admin:TU_PASSWORD@cluster-supergp.xxxxx.mongodb.net/
DB_NAME=supergp_production
CORS_ORIGINS=*

MERCADOPAGO_ACCESS_TOKEN=APP_USR-3036384607288277-112109-0e2ba65d513bf98664e9e5b1b3b8d7fa-437036807
MERCADOPAGO_PUBLIC_KEY=APP_USR-6d930a25-840c-4da0-9627-ca4c140356cc

RESEND_API_KEY=re_TX9cFVwg_9FW31Dgr2wy733MRLwfzXfvN
EMAIL_FROM=inscripciones@coronaclubxp.com
EMAIL_ADMIN=inscripcionescorona@gmail.com

JWT_SECRET=supergp-corona-xp-2026-secret-change-this-in-production

FRONTEND_URL=https://corona-xp-2026.vercel.app
```

### 3.5 Hacer Deploy
```
1. Click "Deploy"
2. Esperar 2-3 minutos
3. ¡Backend desplegado! 🎉
4. Copiar URL (ej: https://corona-xp-2026-backend.vercel.app)
```

---

## PASO 4: DEPLOY FRONTEND EN VERCEL

### 4.1 Crear Nuevo Proyecto
```
1. Click "Add New..." → "Project"
2. Seleccionar MISMO repositorio: corona-xp-2026
3. Click "Import"
```

### 4.2 Configurar Frontend
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: yarn build
Output Directory: build
Install Command: yarn install
```

### 4.3 Variable de Entorno
```
Click "Environment Variables":

REACT_APP_BACKEND_URL=https://TU-BACKEND-URL.vercel.app

(Reemplazar con la URL del backend del paso 3.5)
```

### 4.4 Hacer Deploy
```
1. Click "Deploy"
2. Esperar 2-3 minutos
3. ¡Frontend desplegado! 🎉
4. Tu sitio está en: https://corona-xp-2026.vercel.app
```

---

## PASO 5: CONFIGURACIÓN POST-DEPLOYMENT

### 5.1 Actualizar CORS en Backend
```
1. Ir al proyecto backend en Vercel
2. Settings → Environment Variables
3. Editar CORS_ORIGINS:
   
   De: *
   A: https://corona-xp-2026.vercel.app,https://tu-dominio-custom.com

4. Redeploy (Deployments → tres puntos → Redeploy)
```

### 5.2 Actualizar FRONTEND_URL en Backend
```
1. En Environment Variables del backend
2. Editar FRONTEND_URL:
   
   A: https://corona-xp-2026.vercel.app

3. Redeploy
```

### 5.3 Crear Admin Inicial
```
Usando Postman o curl:

curl -X POST https://TU-BACKEND.vercel.app/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@coronaxp.com",
    "password": "Admin123"
  }'
```

---

## PASO 6: VERIFICACIÓN Y PRUEBAS

### 6.1 Verificar Backend
```
1. Abrir: https://TU-BACKEND.vercel.app/api/
2. Debe mostrar: {"message": "API Super GP Corona XP 2026", "version": "2.0.0"}
```

### 6.2 Verificar Frontend
```
1. Abrir: https://TU-FRONTEND.vercel.app
2. Debe mostrar la página de inicio
3. Navegar a todas las secciones
```

### 6.3 Probar Flujo Completo
```
1. Ir a /inscripcion
2. Llenar formulario
3. Seleccionar categorías
4. Confirmar inscripción
5. Hacer pago de prueba con tarjeta:
   - 5031 7557 3453 0604
   - CVV: 123
   - Fecha: 11/25
   - Nombre: APRO
6. Verificar email recibido
7. Login en /admin/login
8. Verificar inscripción en dashboard
```

---

## PASO 7: DOMINIO PERSONALIZADO (OPCIONAL)

### 7.1 Agregar Dominio Custom en Vercel
```
1. Ir a proyecto frontend en Vercel
2. Settings → Domains
3. Click "Add"
4. Escribir tu dominio: coronaclubxp.com
5. Seguir instrucciones para configurar DNS
```

### 7.2 Configurar DNS
```
En tu proveedor de dominio, agregar registros:

Tipo: A
Name: @
Value: 76.76.21.21

Tipo: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## PASO 8: CONFIGURAR EMAILS CON DOMINIO PROPIO (OPCIONAL)

### 8.1 En Resend
```
1. Ir a: https://resend.com/domains
2. Click "Add Domain"
3. Escribir: coronaclubxp.com
4. Copiar registros DNS mostrados
```

### 8.2 Configurar DNS para Emails
```
En tu proveedor de dominio, agregar:

Tipo: TXT
Name: @
Value: v=spf1 include:resend.net ~all

Tipo: TXT
Name: resend._domainkey
Value: (valor proporcionado por Resend)

Tipo: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@coronaclubxp.com
```

### 8.3 Actualizar Backend
```
1. En Vercel backend → Environment Variables
2. Editar EMAIL_FROM:
   
   De: inscripciones@coronaclubxp.com
   A: noreply@coronaclubxp.com (o el que prefieras)

3. Redeploy
```

---

## 🔧 TROUBLESHOOTING

### Error: "Module not found"
```
Solución:
1. Verificar que requirements_vercel.txt esté en /backend
2. Redeploy con "Clear Cache"
```

### Error: "MongoDB connection failed"
```
Solución:
1. Verificar MONGO_URL en variables de entorno
2. Asegurar que password no tiene caracteres especiales sin escapar
3. Verificar IP whitelist (0.0.0.0/0) en MongoDB Atlas
```

### Error: "CORS blocked"
```
Solución:
1. Actualizar CORS_ORIGINS en backend
2. Incluir URL exacta del frontend
3. Redeploy backend
```

### Emails no llegan
```
Solución:
1. Verificar RESEND_API_KEY
2. Revisar logs en Resend dashboard
3. Verificar que dominio esté verificado (si usas custom)
4. Revisar carpeta de spam
```

---

## 📝 CHECKLIST FINAL

- [ ] MongoDB Atlas configurado
- [ ] Código subido a GitHub
- [ ] Backend desplegado en Vercel
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] CORS actualizado
- [ ] Admin inicial creado
- [ ] Prueba de inscripción exitosa
- [ ] Prueba de pago exitosa
- [ ] Email recibido con QR
- [ ] Dashboard admin funcional
- [ ] Dominio custom configurado (opcional)
- [ ] Emails con dominio propio (opcional)

---

## 🎉 ¡LISTO!

Tu plataforma está desplegada y funcionando en:
- **Frontend:** https://corona-xp-2026.vercel.app
- **Backend:** https://corona-xp-2026-backend.vercel.app
- **Admin:** https://corona-xp-2026.vercel.app/admin/login

**Credenciales Admin:**
- Email: admin@coronaxp.com
- Password: Admin123

**Para Soporte:**
- Vercel Status: https://vercel.com/docs/platform/status
- MongoDB Status: https://status.mongodb.com/
- Resend Status: https://resend.com/status

---

## 📞 PRÓXIMOS PASOS

1. Compartir URL con tu equipo
2. Empezar a recibir inscripciones reales
3. Monitorear dashboard de admin
4. Configurar dominio personalizado
5. Configurar emails con dominio propio
6. ¡Disfrutar del evento! 🏍️

**¿Necesitas ayuda en algún paso? ¡Pregúntame!**
