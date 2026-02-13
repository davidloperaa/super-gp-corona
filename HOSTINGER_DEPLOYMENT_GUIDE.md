# Guía de Deployment en Hostinger VPS

## Índice
1. [Requisitos Previos](#1-requisitos-previos)
2. [Selección del Plan VPS](#2-selección-del-plan-vps)
3. [Configuración Inicial del VPS](#3-configuración-inicial-del-vps)
4. [Instalación de MongoDB](#4-instalación-de-mongodb)
5. [Configuración del Backend (FastAPI)](#5-configuración-del-backend-fastapi)
6. [Configuración del Frontend (React)](#6-configuración-del-frontend-react)
7. [Configuración de Nginx](#7-configuración-de-nginx)
8. [Certificado SSL (HTTPS)](#8-certificado-ssl-https)
9. [Configuración de Email](#9-configuración-de-email)
10. [Comandos de Mantenimiento](#10-comandos-de-mantenimiento)
11. [Solución de Problemas](#11-solución-de-problemas)

---

## 1. Requisitos Previos

Antes de comenzar, necesitas:
- Cuenta en Hostinger con plan VPS activo
- Dominio configurado (puedes usar el de Hostinger o uno externo)
- Cliente SSH (Terminal en Mac/Linux, PuTTY en Windows)
- Credenciales de MercadoPago (ya las tienes)
- API Key de Resend (ya la tienes)

---

## 2. Selección del Plan VPS

### Plan Recomendado: **KVM 2** o superior

| Especificación | KVM 1 | KVM 2 (Recomendado) | KVM 4 |
|---------------|-------|---------------------|-------|
| vCPU | 1 | 2 | 4 |
| RAM | 4 GB | 8 GB | 16 GB |
| Almacenamiento | 50 GB | 100 GB | 200 GB |
| Precio aprox. | $6/mes | $10/mes | $16/mes |

**¿Por qué KVM 2?**
- MongoDB consume ~1GB RAM en reposo
- FastAPI + Gunicorn necesitan ~500MB
- Node.js para build del frontend ~1GB
- Deja margen para crecimiento

### Pasos para comprar:
1. Ve a [hostinger.com](https://www.hostinger.com)
2. Selecciona "VPS Hosting"
3. Elige plan KVM 2 o superior
4. Selecciona ubicación del servidor (recomendado: más cercano a Colombia)
5. Completa la compra

---

## 3. Configuración Inicial del VPS

### 3.1 Acceder al Panel de Hostinger

1. Inicia sesión en [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Ve a "VPS" → selecciona tu servidor
3. En "Sistema Operativo", instala **Ubuntu 22.04 64bit**
4. Anota la **IP del servidor** y **contraseña root**

### 3.2 Conectar por SSH

```bash
ssh root@TU_IP_DEL_SERVIDOR
```

### 3.3 Actualizar el Sistema

```bash
apt update && apt upgrade -y
```

### 3.4 Crear Usuario de Aplicación (Seguridad)

```bash
# Crear usuario
adduser coronaxp
# Agregar a sudoers
usermod -aG sudo coronaxp
# Cambiar a nuevo usuario
su - coronaxp
```

### 3.5 Configurar Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 4. Instalación de MongoDB

### 4.1 Importar Clave GPG de MongoDB

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
```

### 4.2 Agregar Repositorio

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

### 4.3 Instalar MongoDB

```bash
sudo apt update
sudo apt install -y mongodb-org
```

### 4.4 Iniciar y Habilitar MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 4.5 Crear Usuario de Base de Datos (Seguridad)

```bash
mongosh

# Dentro de mongosh:
use admin
db.createUser({
  user: "coronaxp_admin",
  pwd: "TU_PASSWORD_SEGURA_AQUI",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

use coronaxp_db
db.createUser({
  user: "coronaxp_app",
  pwd: "OTRA_PASSWORD_SEGURA",
  roles: [{ role: "readWrite", db: "coronaxp_db" }]
})

exit
```

### 4.6 Habilitar Autenticación

```bash
sudo nano /etc/mongod.conf
```

Busca y modifica:
```yaml
security:
  authorization: enabled
```

Reiniciar MongoDB:
```bash
sudo systemctl restart mongod
```

---

## 5. Configuración del Backend (FastAPI)

### 5.1 Instalar Python y Dependencias

```bash
sudo apt install -y python3 python3-pip python3-venv git
```

### 5.2 Clonar el Repositorio

```bash
cd /home/coronaxp
mkdir app
cd app

# Opción 1: Desde GitHub (si tienes el repo)
git clone https://github.com/tu-usuario/super-gp-corona.git .

# Opción 2: Subir archivos manualmente con SCP o SFTP
```

### 5.3 Configurar Entorno Virtual

```bash
cd /home/coronaxp/app/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### 5.4 Configurar Variables de Entorno

```bash
nano /home/coronaxp/app/backend/.env
```

Contenido:
```env
MONGO_URL=mongodb://coronaxp_app:OTRA_PASSWORD_SEGURA@localhost:27017/coronaxp_db
DB_NAME=coronaxp_db
JWT_SECRET=genera-una-clave-secreta-muy-larga-y-segura-aqui-123456
SUPER_ADMIN_SECRET=otra-clave-secreta-para-super-admin-789012
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_DE_MERCADOPAGO
MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY_DE_MERCADOPAGO
RESEND_API_KEY=TU_API_KEY_DE_RESEND
EMAIL_FROM=inscripciones@tudominio.com
EMAIL_ADMIN=tu-email-admin@gmail.com
FRONTEND_URL=https://tudominio.com
```

### 5.5 Crear Servicio Systemd para el Backend

```bash
sudo nano /etc/systemd/system/coronaxp-backend.service
```

Contenido:
```ini
[Unit]
Description=Corona XP Backend API
After=network.target mongod.service

[Service]
User=coronaxp
Group=coronaxp
WorkingDirectory=/home/coronaxp/app/backend
Environment="PATH=/home/coronaxp/app/backend/venv/bin"
ExecStart=/home/coronaxp/app/backend/venv/bin/gunicorn server:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8001 \
    --access-logfile /var/log/coronaxp/access.log \
    --error-logfile /var/log/coronaxp/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 5.6 Crear Directorio de Logs

```bash
sudo mkdir -p /var/log/coronaxp
sudo chown coronaxp:coronaxp /var/log/coronaxp
```

### 5.7 Crear Directorio de Uploads

```bash
mkdir -p /home/coronaxp/app/backend/uploads
chmod 755 /home/coronaxp/app/backend/uploads
```

### 5.8 Iniciar el Servicio

```bash
sudo systemctl daemon-reload
sudo systemctl start coronaxp-backend
sudo systemctl enable coronaxp-backend
sudo systemctl status coronaxp-backend
```

---

## 6. Configuración del Frontend (React)

### 6.1 Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 6.2 Configurar Variables de Entorno del Frontend

```bash
nano /home/coronaxp/app/frontend/.env
```

Contenido:
```env
REACT_APP_BACKEND_URL=https://tudominio.com
```

### 6.3 Construir el Frontend

```bash
cd /home/coronaxp/app/frontend
npm install
npm run build
```

Esto generará una carpeta `build/` con los archivos estáticos.

---

## 7. Configuración de Nginx

### 7.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 7.2 Crear Configuración del Sitio

```bash
sudo nano /etc/nginx/sites-available/coronaxp
```

Contenido:
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Frontend (archivos estáticos de React)
    root /home/coronaxp/app/frontend/build;
    index index.html;

    # Configuración de archivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Archivos de uploads
    location /uploads/ {
        alias /home/coronaxp/app/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Limitar tamaño de uploads (para imágenes)
    client_max_body_size 10M;
}
```

### 7.3 Habilitar el Sitio

```bash
sudo ln -s /etc/nginx/sites-available/coronaxp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Eliminar sitio por defecto
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

---

## 8. Certificado SSL (HTTPS)

### 8.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtener Certificado

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Sigue las instrucciones y proporciona tu email.

### 8.3 Renovación Automática

El certificado se renueva automáticamente. Puedes verificar con:
```bash
sudo certbot renew --dry-run
```

---

## 9. Configuración de Email

### Opción A: Usar el Email de Hostinger (Recomendado)

1. En hPanel, ve a "Emails" → "Configurar"
2. Crea una cuenta: `inscripciones@tudominio.com`
3. Actualiza el `.env` del backend con las credenciales SMTP de Hostinger

### Opción B: Seguir usando Resend

Si prefieres mantener Resend, necesitarás verificar tu dominio:
1. Ve a [resend.com/domains](https://resend.com/domains)
2. Agrega tu dominio
3. Configura los registros DNS en Hostinger:
   - SPF record
   - DKIM record
   - DMARC record

---

## 10. Comandos de Mantenimiento

### Ver Logs del Backend
```bash
sudo tail -f /var/log/coronaxp/error.log
sudo tail -f /var/log/coronaxp/access.log
```

### Reiniciar Servicios
```bash
sudo systemctl restart coronaxp-backend
sudo systemctl restart nginx
sudo systemctl restart mongod
```

### Ver Estado de Servicios
```bash
sudo systemctl status coronaxp-backend
sudo systemctl status nginx
sudo systemctl status mongod
```

### Actualizar la Aplicación
```bash
cd /home/coronaxp/app

# Opción 1: Si usas Git
git pull origin main

# Actualizar Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart coronaxp-backend

# Actualizar Frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

### Backup de Base de Datos
```bash
mongodump --db coronaxp_db --out /home/coronaxp/backups/$(date +%Y%m%d)
```

### Restaurar Backup
```bash
mongorestore --db coronaxp_db /home/coronaxp/backups/FECHA/coronaxp_db
```

---

## 11. Solución de Problemas

### El sitio no carga
```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar Backend
sudo systemctl status coronaxp-backend
sudo tail -100 /var/log/coronaxp/error.log
```

### Error de conexión a MongoDB
```bash
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

### Los cambios no se reflejan
```bash
# Limpiar caché de Nginx
sudo systemctl reload nginx

# Reconstruir frontend
cd /home/coronaxp/app/frontend
npm run build
```

### Permisos de archivos
```bash
sudo chown -R coronaxp:coronaxp /home/coronaxp/app
chmod 755 /home/coronaxp/app/backend/uploads
```

---

## Resumen de URLs

| Servicio | URL |
|----------|-----|
| Sitio Web | https://tudominio.com |
| Admin Evento | https://tudominio.com/admin/login |
| Super Admin | https://tudominio.com/superadmin/login |
| API Backend | https://tudominio.com/api/ |

---

## Checklist de Deployment

- [ ] VPS creado y configurado
- [ ] MongoDB instalado y con autenticación
- [ ] Backend funcionando con Gunicorn
- [ ] Frontend construido y servido por Nginx
- [ ] SSL configurado (HTTPS)
- [ ] Dominio apuntando al servidor
- [ ] Variables de entorno configuradas
- [ ] Directorio de uploads creado
- [ ] Firewall configurado
- [ ] Usuarios admin y super admin creados en la base de datos

---

## Contacto de Soporte Hostinger

- Chat en vivo: Disponible 24/7 en hpanel
- Base de conocimiento: [support.hostinger.com](https://support.hostinger.com)

---

*Guía creada el 13 de Febrero de 2026 para Super GP Corona XP*
