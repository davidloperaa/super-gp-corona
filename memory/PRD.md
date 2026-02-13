# Campeonato Interligas Super GP Corona XP 2026 - PRD

## Descripción del Proyecto
Sitio web moderno, dinámico y responsive para el evento de motociclismo "Campeonato Interligas Super GP Corona XP 2026". Plataforma multi-tenant diseñada para comercializar eventos similares.

## Requisitos Core

### Páginas Principales
- [x] Home (descripción del evento)
- [x] Calendario (programación del evento)
- [x] Categorías de inscripción
- [x] Formulario de inscripción
- [x] Galería de imágenes
- [x] Sección de Noticias

### Diseño
- [x] Paleta de colores: rojo, negro y blanco
- [x] Tono vibrante, moderno y energético
- [x] Diseño responsive

### Sistema de Inscripción
- [x] Formulario con: nombre completo, cédula, número de competición, celular, email, liga afiliada
- [x] Multi-selección de 32 categorías de carrera
- [x] Precios diferenciados por categoría
- [x] Sistema de cupones de descuento (100%, 50%, 30%)

### Pagos
- [x] Integración con MercadoPago
- [x] Webhook para confirmación de pagos
- [x] Pago obligatorio a menos que se use cupón de 100%

### Panel de Administración (CMS)
- [x] Gestión de inscripciones
- [x] Gestión de pagos
- [x] Gestión de cupones de descuento
- [x] Edición de contenido (títulos, descripciones, fechas, footer, header)
- [x] Gestión de precios por categoría
- [x] **COMPLETADO**: Subida de imagen para logo personalizado
- [x] **COMPLETADO**: Sistema de gestión de galería de imágenes
- [ ] **PENDIENTE**: Editor WYSIWYG para textos largos
- [ ] **PENDIENTE**: Vista previa en tiempo real de cambios

### Sistema de Comisiones (NUEVO - 13 Feb 2026)
- [x] Panel de Super Admin separado del admin de eventos
- [x] Configuración de comisiones por porcentaje o monto fijo
- [x] Cálculo automático de comisiones en cada inscripción
- [x] Estadísticas de comisiones totales
- [x] Gestión de credenciales MercadoPago por evento

### Notificaciones
- [x] Emails de confirmación automáticos via Resend
- [x] Código QR incluido en emails
- [x] Endpoint para reenvío de emails fallidos

### Sistema de Verificación
- [x] Generación de código QR único por inscripción pagada
- [x] Escáner de QR en panel admin para verificar asistencia

## Información del Evento
- **Fechas**: 27, 28 de Febrero y 1 de Marzo 2026
- **Ubicación**: Corona Club XP, Popayán
- **Categorías**: 31 categorías diferentes

## Arquitectura Técnica

### Backend
- FastAPI (Python)
- MongoDB (base de datos)
- Pydantic (validación de datos)
- Upload de imágenes local (/uploads)

### Frontend
- React.js
- Tailwind CSS
- React Router DOM
- React Quill (WYSIWYG - instalado)

### Integraciones
- MercadoPago (pagos) - Configuración dinámica por evento
- Resend (emails transaccionales)
- QR Code generation (qrcode library)

## Estado de Implementación

### Completado (13 Feb 2026)
- Actualización de fechas del evento a 27, 28 Feb y 1 Mar 2026
- Panel de Super Admin completo con:
  - Login separado (/superadmin/login)
  - Dashboard con estadísticas de comisiones
  - Configuración de comisiones (porcentaje/fijo)
  - Gestión de credenciales MercadoPago del evento
  - Vista de todos los registros con detalles de comisión
- Sistema de upload de imágenes:
  - Logo del evento
  - Imagen Hero
  - Gestión de galería con drag & drop y reordenamiento

### Tareas Pendientes

#### P0 - Alta Prioridad
- [ ] Editor WYSIWYG para campos de texto largo
- [ ] Vista previa en tiempo real en admin panel

#### P1 - Media Prioridad  
- [ ] Hacer el calendario completamente dinámico desde admin

#### P2 - Baja Prioridad
- [ ] Finalizar guía de deployment (Vercel vs Hostinger)

## Credenciales y Configuración
Ver `/app/credentials.md` para detalles de acceso admin y super admin.

## Documentos Relacionados
- `/app/DEPLOYMENT_GUIDE.md`
- `/app/VERCEL_DEPLOYMENT_GUIDE.md`
- `/app/RESEND_EMAIL_INFO.md`
- `/app/credentials.md`
