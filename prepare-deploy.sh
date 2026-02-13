#!/bin/bash
# =============================================================================
# Script para preparar archivos para deployment
# Ejecutar ANTES de subir al servidor
# =============================================================================

echo "Preparando archivos para deployment..."

# Crear directorio de exportación
EXPORT_DIR="/tmp/coronaxp-deploy"
rm -rf $EXPORT_DIR
mkdir -p $EXPORT_DIR/backend
mkdir -p $EXPORT_DIR/frontend

# Copiar backend (excluyendo venv, __pycache__, uploads)
echo "Copiando backend..."
cp -r /app/backend/*.py $EXPORT_DIR/backend/
cp /app/backend/requirements.txt $EXPORT_DIR/backend/
cp /app/backend/.env.example $EXPORT_DIR/backend/ 2>/dev/null || true
mkdir -p $EXPORT_DIR/backend/uploads

# Crear .env.example si no existe
cat > $EXPORT_DIR/backend/.env.example << 'EOF'
MONGO_URL=mongodb://coronaxp_app:TU_PASSWORD@localhost:27017/coronaxp_db
DB_NAME=coronaxp_db
JWT_SECRET=genera-una-clave-secreta-muy-larga
SUPER_ADMIN_SECRET=otra-clave-para-super-admin
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key
RESEND_API_KEY=tu-api-key-resend
EMAIL_FROM=inscripciones@tudominio.com
EMAIL_ADMIN=admin@gmail.com
FRONTEND_URL=https://tudominio.com
EOF

# Copiar frontend (excluyendo node_modules, build)
echo "Copiando frontend..."
cp -r /app/frontend/src $EXPORT_DIR/frontend/
cp -r /app/frontend/public $EXPORT_DIR/frontend/
cp /app/frontend/package.json $EXPORT_DIR/frontend/
cp /app/frontend/package-lock.json $EXPORT_DIR/frontend/ 2>/dev/null || true
cp /app/frontend/tailwind.config.js $EXPORT_DIR/frontend/
cp /app/frontend/jsconfig.json $EXPORT_DIR/frontend/ 2>/dev/null || true

# Crear .env.example para frontend
cat > $EXPORT_DIR/frontend/.env.example << 'EOF'
REACT_APP_BACKEND_URL=https://tudominio.com
EOF

# Copiar documentación y scripts
echo "Copiando documentación..."
cp /app/HOSTINGER_DEPLOYMENT_GUIDE.md $EXPORT_DIR/
cp /app/deploy-hostinger.sh $EXPORT_DIR/
cp /app/credentials.md $EXPORT_DIR/

# Crear archivo ZIP
echo "Creando archivo ZIP..."
cd /tmp
zip -r coronaxp-deploy.zip coronaxp-deploy

echo ""
echo "=========================================="
echo "  Archivos preparados exitosamente!"
echo "=========================================="
echo ""
echo "Archivo ZIP creado en: /tmp/coronaxp-deploy.zip"
echo ""
echo "Contenido del ZIP:"
echo "  - backend/       (código Python)"
echo "  - frontend/      (código React)"
echo "  - HOSTINGER_DEPLOYMENT_GUIDE.md"
echo "  - deploy-hostinger.sh"
echo "  - credentials.md"
echo ""
echo "Para descargar: usa SCP o el panel de archivos"
echo "  scp root@servidor:/tmp/coronaxp-deploy.zip ./local/"
