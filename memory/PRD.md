# Campeonato Interligas Super GP Corona XP 2026 - PRD

## Descripción del Proyecto
Sitio web moderno y dinámico para un evento de carreras de motocicletas, con sistema de inscripción, pagos online, y panel de administración completo.

## Stack Tecnológico
- **Frontend**: React.js, Tailwind CSS
- **Backend**: FastAPI, Python, MongoDB (Motor async)
- **Integraciones**: MercadoPago (producción), Resend (producción con dominio verificado vittalix.com)
- **Despliegue**: Docker, EasyPanel en Hostinger VPS

## Credenciales de Acceso
- **Admin**: `/admin/login` - admin@coronaxp.com / Admin2026!
- **Super Admin**: `/superadmin/login` - super@plataforma.com / SuperAdmin2026!

---

## Estado de Implementación

### ✅ Completado

#### Páginas Públicas
- [x] Home con diseño vibrante (rojo, negro, blanco)
- [x] Calendario de eventos
- [x] Categorías de competición (dinámicas desde DB)
- [x] Galería de imágenes
- [x] Noticias/Actualizaciones
- [x] Formulario de inscripción multi-paso

#### Sistema de Inscripción
- [x] Formulario con validación de campos
- [x] Validación de celular (mínimo 10 dígitos) con indicador visual
- [x] Selección múltiple de categorías
- [x] Cupones de descuento
- [x] Precios diferenciados por categoría
- [x] Generación de código QR por registro

#### Integración de Pagos
- [x] MercadoPago con credenciales de producción
- [x] Creación de preferencias de pago
- [x] Webhook para actualización automática de estado
- [x] Verificación manual de pagos
- [x] Página de pago exitoso con verificación automática

#### Sistema de Emails
- [x] Integración Resend con dominio verificado (vittalix.com)
- [x] Email de confirmación con QR code
- [x] Envío a administrador en CC
- [x] Reenvío de emails desde admin

#### Panel de Administración
- [x] Login con JWT (7 días de sesión)
- [x] Dashboard con estadísticas
- [x] CRUD completo de categorías
- [x] Gestión de precios
- [x] Gestión de inscripciones con filtros
- [x] Exportación a Excel (todas, filtradas, por categoría)
- [x] Verificación manual de pagos
- [x] Gestión de cupones
- [x] Gestión de noticias
- [x] Gestión de galería
- [x] Sistema de check-in con QR
- [x] Navbar consistente con navegación

#### Super Admin (Multi-tenant)
- [x] Login separado
- [x] Configuración de comisiones (porcentaje/fijo)
- [x] Estadísticas de comisiones
- [x] Vista de todas las inscripciones

#### Despliegue
- [x] Dockerfiles configurados (frontend con yarn, backend con gunicorn)
- [x] Desplegado en EasyPanel/Hostinger
- [x] Variables de entorno en producción

---

## 🟡 Pendiente de Verificación
- [ ] Botón "Guardar Todos" en página de precios de categorías

## 📋 Próximas Tareas (P1-P2)
- [ ] Test completo end-to-end del flujo de registro y pago
- [ ] Configuración de dominio personalizado para frontend

## 🔮 Tareas Futuras
- [ ] WYSIWYG editor para contenido de noticias
- [ ] Soporte multi-evento (más allá del default)
- [ ] Dashboard mejorado con gráficos

---

## Arquitectura de Archivos Clave

```
/app/
├── backend/
│   ├── server.py          # API principal FastAPI
│   ├── models.py          # Modelos Pydantic
│   ├── qr_service.py      # Generación/verificación QR
│   └── .env               # Variables de entorno
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Inscripcion.js    # Formulario de registro
│       │   ├── PagoExitoso.js    # Confirmación de pago
│       │   └── admin/            # Páginas de admin
│       └── components/
│           └── AdminNavbar.js    # Navegación admin
```

---

## Changelog

### 2025-02-14 - Fix Validación de Celular
- Agregada validación frontend para celular (mínimo 10 dígitos)
- Indicador visual de contador de dígitos
- Mejor manejo de errores de validación del backend
- Mensajes de error traducidos a español

### 2025-02-14 - Rediseño Email de Confirmación
- Plantilla con fondo blanco y texto oscuro (alto contraste)
- QR Code usando QuickChart.io (compatible con Gmail, Outlook, etc.)
- Email de contacto actualizado a inscripcionescorona@gmail.com
- CSS 100% inline para máxima compatibilidad

### 2025-02-14 - Mejoras Panel de Administración
- Galería pública ahora carga desde base de datos
- Calendario público ahora carga desde API
- AdminNavbar agregado a todas las páginas admin
- Botón "Vista Previa" en Configuración, Galería y Calendario
- Nueva página /admin/calendario para gestionar días/actividades/disciplinas
- Endpoints: GET /api/calendar, PUT /api/admin/calendar
