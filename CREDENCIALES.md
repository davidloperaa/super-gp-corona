# Campeonato Interligas Super GP Corona XP 2026 - ACTUALIZADO

## 🏍️ Acceso a la Aplicación

**URL Pública:** https://coronaxp-build.preview.emergentagent.com

## 🔐 Credenciales de Administrador

**Panel Admin:** https://coronaxp-build.preview.emergentagent.com/admin/login

- **Email:** admin@coronaxp.com
- **Contraseña:** Admin123

## 💳 Integración de Pagos - MercadoPago

✅ **INTEGRACIÓN COMPLETA EN PRODUCCIÓN**

- **Access Token:** APP_USR-3036384607288277-112109... (configurado en backend)
- **Public Key:** APP_USR-6d930a25-840c-4da0-9627-ca4c140356cc
- **Entorno:** PRODUCCIÓN
- **País:** Colombia (COP)

### Flujo de Pago Implementado:
1. Usuario completa inscripción con sus datos y categorías
2. Sistema calcula precio automáticamente
3. Si tiene cupón 100% → Inscripción completada sin pago
4. Si requiere pago → Redirect a MercadoPago checkout
5. Usuario completa pago en MercadoPago
6. Webhook notifica al backend automáticamente
7. Email de confirmación enviado automáticamente

## 📧 Sistema de Notificaciones por Email - Resend

✅ **INTEGRACIÓN COMPLETA**

- **Servicio:** Resend
- **API Key:** re_TX9cFVwg_9FW31Dgr2wy733MRLwfzXfvN (configurado)
- **Email From:** onboarding@resend.dev (dominio de prueba)
- **Email Admin CC:** inscripcionescorona@gmail.com

### Emails Automáticos:
- ✅ Confirmación de inscripción (envío inmediato)
- ✅ Copia al administrador en cada inscripción
- ✅ Template HTML personalizado con branding del evento

## 💰 Sistema de Precios

### Precio Estándar Actual
**TODAS las categorías: COP $120,000**

### Gestión de Precios desde Admin
✅ Panel Admin → Gestionar Precios
- Modificar precio de cualquier categoría individualmente
- Actualización masiva de todos los precios
- Cambios se aplican instantáneamente

### Sistema de Fases
- **Preventa** (enero): 15% descuento automático
- **Ordinaria** (febrero): Precio normal
- **Extraordinaria** (marzo+): +20% sobre precio base

### Cupones Disponibles
1. **PREVENTA30** - 30% descuento (100 usos máx.)
2. **ESPECIAL50** - 50% descuento (50 usos máx.)
3. Crear nuevos cupones desde el panel admin (30%, 50%, 100%)

## 🎨 Panel de Administración - CMS Completo

### Secciones Disponibles:

1. **Dashboard** (`/admin/dashboard`)
   - Estadísticas en tiempo real
   - Total inscripciones e ingresos
   - Acceso rápido a todas las funciones

2. **Gestionar Inscripciones** (`/admin/registrations`)
   - Ver todas las inscripciones
   - Filtrar por estado de pago
   - Exportar datos
   - Información completa de cada piloto

3. **Gestionar Cupones** (`/admin/coupons`)
   - Crear cupones personalizados
   - Configurar descuentos (30%, 50%, 100%)
   - Límite de usos
   - Activar/desactivar cupones

4. **Publicar Noticias** (`/admin/news`)
   - Crear actualizaciones del evento
   - Agregar imágenes
   - Mostrar automáticamente en la página

5. **✨ NUEVO - Gestionar Precios** (`/admin/precios`)
   - Editar precio de cada una de las 31 categorías
   - Actualización individual o masiva
   - Cambios en tiempo real

6. **✨ NUEVO - Gestionar Contenido** (`/admin/contenido`)
   - Editar textos del Hero
   - Modificar información del evento
   - Actualizar datos de contacto
   - Cambiar enlaces de redes sociales
   - **Parametrizar completamente la página sin tocar código**

## 📋 Funcionalidades Completas

### Páginas Públicas
- ✅ Landing page con diseño impactante
- ✅ 31 Categorías con precios dinámicos
- ✅ Calendario detallado del evento
- ✅ Galería de imágenes
- ✅ Noticias y actualizaciones
- ✅ Formulario de inscripción multi-step (3 pasos)

### Proceso de Inscripción
1. **Paso 1:** Datos personales completos
2. **Paso 2:** Selección múltiple de categorías
3. **Paso 3:** Aplicar cupón y ver resumen
4. **Pago:** Redirect automático a MercadoPago
5. **Confirmación:** Email automático + página de éxito

### Páginas de Estado de Pago
- ✅ `/pago-exitoso` - Confirmación de pago exitoso
- ✅ `/pago-fallido` - Pago rechazado/cancelado
- ✅ `/pago-pendiente` - Pago en proceso

## 🔧 Tecnologías Implementadas

**Frontend:**
- React 19
- React Router DOM
- Axios para API calls
- Tailwind CSS + diseño "Midnight Asphalt"
- Fuentes: Oxanium & Space Grotesk

**Backend:**
- FastAPI con async/await
- MongoDB (Motor async driver)
- JWT Authentication
- **MercadoPago SDK 2.3.0** (producción)
- **Resend para emails** (API REST)
- Bcrypt para passwords
- Pydantic para validación

## 📊 Estadísticas del Sistema

- **31 Categorías** de competencia
- **Precio estándar:** COP $120,000 por categoría
- **3 Fases** de precios (preventa, ordinaria, extraordinaria)
- **Cupones ilimitados** (configurables desde admin)
- **Emails automáticos** con Resend
- **Pagos en producción** con MercadoPago Colombia

## 🚀 Mejoras Implementadas en Esta Versión

### ✅ Integración Completa MercadoPago
- Checkout redirect flow implementado
- Webhooks configurados y funcionando
- Manejo de estados: éxito, fallido, pendiente
- URLs de retorno configuradas

### ✅ Sistema de Emails Automatizado
- Confirmación inmediata al usuario
- Copia al admin en cada inscripción
- Template HTML profesional
- Toda la información de la inscripción incluida

### ✅ Panel Admin CMS Completo
- Gestión de precios por categoría
- Editor de contenido sin código
- Parametrización total del sitio
- Interfaz intuitiva y rápida

### ✅ Precios Actualizados
- Todas las categorías a COP $120,000
- Sistema flexible para cambios futuros
- Actualización instantánea

## 📝 Endpoints API Principales

### Nuevos Endpoints:

**Pagos:**
- `POST /api/payments/create-preference` - Crear preferencia de pago MercadoPago
- `POST /api/webhooks/mercadopago` - Recibir notificaciones de pago
- `GET /api/mercadopago/public-key` - Obtener public key para frontend

**Admin CMS:**
- `GET /api/admin/category-prices` - Obtener precios actuales
- `PUT /api/admin/category-price` - Actualizar precio de categoría
- `GET /api/content` - Obtener contenido del sitio
- `PUT /api/admin/content` - Actualizar contenido del sitio

## 🎯 Próximas Mejoras Recomendadas

1. **Dashboard Avanzado:** Gráficas de inscripciones por día/categoría
2. **Reportes:** Generación de PDFs con listas de inscritos
3. **Verificación de Asistencia:** QR codes para check-in en el evento
4. **Estadísticas en Vivo:** Contador de inscritos por categoría
5. **Multi-idioma:** Soporte para inglés/portugués

## 🔐 Seguridad Implementada

- ✅ JWT para autenticación admin
- ✅ Bcrypt para passwords
- ✅ Validación de webhooks MercadoPago
- ✅ Sanitización de inputs con Pydantic
- ✅ CORS configurado correctamente
- ✅ Credenciales en variables de entorno

## 📞 Soporte

**Email Admin:** inscripcionescorona@gmail.com
**Email Inscripciones:** inscripciones@coronaclubxp.com

---

**Última Actualización:** 9 de Febrero 2026
**Versión del Sistema:** 2.0.0
**Estado:** ✅ PRODUCCIÓN - Totalmente funcional con pagos reales

**NOTA IMPORTANTE:** Este sistema está configurado con credenciales de producción de MercadoPago. Todos los pagos procesados son REALES y se cobrarán a las tarjetas de los usuarios.
