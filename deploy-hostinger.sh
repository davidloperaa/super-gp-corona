#!/bin/bash
# =============================================================================
# Script de Deployment para Super GP Corona XP
# Ejecutar en el servidor VPS de Hostinger
# =============================================================================

set -e  # Detener si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

# Variables de configuración (MODIFICAR ANTES DE EJECUTAR)
DOMAIN="tudominio.com"
APP_USER="coronaxp"
APP_DIR="/home/$APP_USER/app"
DB_NAME="coronaxp_db"
DB_USER="coronaxp_app"
DB_PASS="CAMBIAR_POR_PASSWORD_SEGURA"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Super GP Corona XP${NC}"
echo -e "${GREEN}========================================${NC}"

# Función para mostrar progreso
show_progress() {
    echo -e "${YELLOW}>>> $1${NC}"
}

# 1. Actualizar sistema
show_progress "Actualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependencias básicas
show_progress "Instalando dependencias..."
apt install -y git python3 python3-pip python3-venv nginx curl gnupg

# 3. Instalar Node.js
show_progress "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Instalar MongoDB
show_progress "Instalando MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# 5. Crear usuario de aplicación
show_progress "Creando usuario de aplicación..."
if ! id "$APP_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $APP_USER
fi

# 6. Crear directorios
show_progress "Creando directorios..."
mkdir -p $APP_DIR/backend/uploads
mkdir -p $APP_DIR/frontend
mkdir -p /var/log/coronaxp
chown -R $APP_USER:$APP_USER $APP_DIR
chown -R $APP_USER:$APP_USER /var/log/coronaxp

# 7. Crear servicio systemd para backend
show_progress "Configurando servicio del backend..."
cat > /etc/systemd/system/coronaxp-backend.service << EOF
[Unit]
Description=Corona XP Backend API
After=network.target mongod.service

[Service]
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
ExecStart=$APP_DIR/backend/venv/bin/gunicorn server:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8001 \
    --access-logfile /var/log/coronaxp/access.log \
    --error-logfile /var/log/coronaxp/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 8. Configurar Nginx
show_progress "Configurando Nginx..."
cat > /etc/nginx/sites-available/coronaxp << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/frontend/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    location /uploads/ {
        alias $APP_DIR/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
EOF

ln -sf /etc/nginx/sites-available/coronaxp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 9. Configurar firewall
show_progress "Configurando firewall..."
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# 10. Recargar servicios
show_progress "Recargando servicios..."
systemctl daemon-reload
nginx -t && systemctl reload nginx

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Instalación base completada!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Sube los archivos de la aplicación a:"
echo "   - Backend: $APP_DIR/backend/"
echo "   - Frontend: $APP_DIR/frontend/"
echo ""
echo "2. Configura el backend:"
echo "   cd $APP_DIR/backend"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo "   pip install -r requirements.txt"
echo "   pip install gunicorn"
echo ""
echo "3. Configura las variables de entorno:"
echo "   nano $APP_DIR/backend/.env"
echo ""
echo "4. Construye el frontend:"
echo "   cd $APP_DIR/frontend"
echo "   npm install"
echo "   npm run build"
echo ""
echo "5. Inicia el backend:"
echo "   systemctl start coronaxp-backend"
echo "   systemctl enable coronaxp-backend"
echo ""
echo "6. Configura SSL con Certbot:"
echo "   apt install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo -e "${GREEN}¡Listo para producción!${NC}"
