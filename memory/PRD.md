# Campeonato Interligas Super GP Corona XP 2026

## Descripción del Proyecto
Sitio web moderno y dinámico para el evento de carreras de motocicletas "Campeonato Interligas Super GP Corona XP 2026".

## Stack Tecnológico
- **Frontend:** React.js, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Base de datos:** MongoDB
- **Integraciones:** MercadoPago (pagos), Resend (emails), QuickChart.io (QR codes)
- **Despliegue:** Docker, EasyPanel en Hostinger VPS

## Funcionalidades Core Implementadas

### 1. Sistema de Inscripción
- Formulario multi-paso (Datos Personales → Categorías → Resumen y Pago)
- Validación de campos (teléfono mínimo 10 dígitos)
- Selección de múltiples categorías agrupadas
- Cálculo dinámico de precios por fase
- Sistema de cupones de descuento

### 2. Sistema de Pagos (Manual)
- **MercadoPago DESHABILITADO** — el sitio opera en modo pre-inscripción manual
- Pago vía transferencia bancaria: Bancolombia, Davivienda, Nequi (3104223288)
- Subida opcional de Comprobante de Pago en el último paso del formulario
  - Si se adjunta → estado_pago = "completado" y se envía email de confirmación
  - Si NO se adjunta → estado_pago = "pendiente" (validación manual posterior)
  - Advertencia de "una sola vez" si se envía sin archivo
- Admin puede ver el comprobante desde `/admin/registrations` y exportar columnas "Adjuntó comprobante" + "URL Comprobante" en CSV
- Verificación manual de pagos desde admin

### 3. Notificaciones por Email (Resend)
- Confirmación de inscripción con diseño inline CSS
- Código QR funcional vía QuickChart.io
- Información del evento y categorías

### 4. Panel de Administración
- **Dashboard:** Estadísticas de inscripciones
- **Inscripciones:** Lista completa, búsqueda, export Excel
- **Cupones:** CRUD completo
- **Precios:** Gestión de precios por categoría
- **Categorías:** CRUD con grupos
- **Calendario:** Gestión de eventos y actividades
- **Galería:** Subida y gestión de imágenes
- **Configuración:** Logo, título, información del sitio
- **QR Scanner:** Check-in de participantes

### 5. Super Admin (Plataforma)
- Gestión de comisiones
- Configuración de MercadoPago del evento
- Estadísticas de ingresos

### 6. Páginas Públicas
- Home con información del evento
- Categorías agrupadas con premiación
- Calendario del evento
- Galería de imágenes
- Noticias
- Inscripción

## Categorías (30 total)

### VELOCIDAD TOP (5)
1. 115cc Elite
2. 150cc 2T
3. SuperMoto
4. 115cc Novatos
5. Hasta 220 4T Elite

### VELOCIDAD (9)
6. 115cc Master
7. 115cc Principiantes
8. Infantil hasta 150 4T y 100cc 2T no racer
9. Hasta 220 4T Novatos
10. Ax 100 Novatos
11. (GP1) motos 4T hasta 160cc
12. Ax100, NKD, Scooter Novatos
13. Minimotard
14. Libre Cilindraje (No Supermoto)

### VELOCIDAD RECREATIVAS (10)
15. Clientes Liquimoly hasta 200cc 4T (promo compra mínima)
16. Clientes LiquiMoly Libre cilindraje 4T (promo compra mínima)
17. Fórmula Colombia motos carenadas
18. Alto cilindraje + 300cc 4T
19. Pilotos LICAMO (Inscripción $40.000)
20. Crypton Original Novatos (llantas no Slick)
21. Boxer CT 100/ NKD 125 Recreativa RPDD
22. 150cc 4T Stock Multimarca Recreativa RPDD
23. 200 4T Stock Multimarca No Slick Recreativa RPDD
24. Femenina libre 4t hasta 200cc

### KARTS (2)
25. Directos (sin cambios)
26. Shifter, Dd2 (con cambios)

### VELOTIERRA (2)
27. Velotierra hasta 85cc 2T o 150cc 4T
28. Velotierra Libre desde 125cc 2T y 250 4T

### MOTOCROSS (2)
29. Motocross hasta 85cc 2T o 150cc 4T
30. Motocross Libre desde 125cc 2T y 250 4T

## Credenciales

### Admin
- URL: `/admin/login`
- Email: `admin@coronaxp.com`
- Password: `Admin2026!`

### Super Admin
- URL: `/superadmin/login`
- Email: `super@plataforma.com`
- Password: `SuperAdmin2026!`

## Verificaciones Pendientes
1. ⏳ Flujo completo de inscripción y pago
2. ⏳ Email de confirmación con QR funcional
3. ⏳ CMS guardando cambios correctamente
4. ⏳ Botón "Guardar Todos" en precios

## Cambios Recientes (Feb 2026)
- ✅ Feature P0: Comprobante de Pago opcional en `/inscripcion`
  - Frontend (`Inscripcion.js`): input file con lógica "one-time warning", subida tras crear registro
  - Backend: endpoint `POST /api/registrations/{id}/upload-comprobante` actualiza estado_pago→"completado" y envía email
  - Admin (`AdminRegistrations.js`): columna "Comprobante" con link "Ver" + CSV con columnas "Adjuntó comprobante" y "URL Comprobante"
  - Mount `/api/uploads` para que los archivos sean accesibles a través del ingress (Kubernetes preview)
  - Estado normalizado: "pendiente"/"completado" (eliminadas variantes "pendiente_pago"/"confirmado")
  - Tests: `/app/backend/tests/test_comprobante_flow.py` (5/5 backend) + E2E Playwright (3/3 flows)

## Tareas Futuras
1. Configuración de dominio personalizado
2. Refactorizar Admin con componente `AdminLayout` compartido
3. Modularizar `server.py` (1776 líneas) en routers (registrations, admin, payments, gallery)
4. Agregar autenticación al endpoint `/upload-comprobante` o cambiar a URL firmada (mejora de seguridad)
5. Limpiar dead code de MercadoPago en `server.py`
6. Investigar warnings de hidratación React en componentes admin (`<span>` dentro de `<select>/<tr>/<tbody>`)

## Última Actualización
- **Fecha:** Febrero 2026
- **Cambio:** Feature de Comprobante de Pago opcional en /inscripcion (estado se actualiza automáticamente a "completado" al subir archivo). Visible y exportable en admin.
