# Campeonato Interligas Super GP Corona XP 2026

## 🏍️ Acceso a la Aplicación

**URL Pública:** https://corona-xp-2026.preview.emergentagent.com

## 🔐 Credenciales de Administrador

**Panel Admin:** https://corona-xp-2026.preview.emergentagent.com/admin/login

- **Email:** admin@coronaxp.com
- **Contraseña:** Admin123

## 💳 Cupones de Descuento Disponibles

1. **PREVENTA30**
   - Descuento: 30%
   - Usos máximos: 100
   - Estado: Activo

2. **ESPECIAL50**
   - Descuento: 50%
   - Usos máximos: 50
   - Estado: Activo

## 📋 Funcionalidades Implementadas

### Páginas Públicas
- ✅ Home / Landing Page con hero impactante
- ✅ Categorías (32 categorías de motociclismo)
- ✅ Calendario del evento (20-22 Febrero 2026)
- ✅ Galería de imágenes
- ✅ Noticias y actualizaciones
- ✅ Formulario de inscripción multi-step

### Formulario de Inscripción (3 pasos)
1. **Datos Personales**
   - Nombre y apellido
   - Cédula
   - Número de competición
   - Celular
   - Correo electrónico

2. **Selección de Categorías**
   - 32 categorías disponibles
   - Selección múltiple
   - Precios diferenciados por categoría

3. **Resumen y Pago**
   - Aplicación de cupones de descuento
   - Cálculo automático de precios
   - Sistema de fases (preventa, ordinaria, extraordinaria)

### Panel de Administración
- ✅ Login seguro con JWT
- ✅ Dashboard con estadísticas
- ✅ Gestión de inscripciones
- ✅ Crear y gestionar cupones de descuento (30%, 50%, 100%)
- ✅ Publicar noticias

## 🎨 Diseño

**Tema:** Midnight Asphalt (Dark Mode)
**Colores:**
- Primario: #FF0000 (Rojo)
- Secundario: #00CED1 (Cian)
- Acento: #E6007E (Magenta)
- Warning: #FFDA00 (Amarillo)
- Fondo: #050505 (Negro)

**Fuentes:**
- Headings: Oxanium
- Body: Space Grotesk

## 📊 Categorías del Evento

1. INFANTIL
2. INFANTIL MINI
3. 115 2T Élite
4. 150 2T Élite
5. 115 2T Master
6. 115 2T Novatos
7. 150 2T Novatos
8. 115 2T Principiantes
9. Categoría Libre
10. Ax100 - NKD y Scooter Novatos
11. Ax100 - NKD y Scooter Elite
12. 220 4T Novatos
13. 220 4T Élite
14. Super Moto
15. GP1 motos 4T hasta 160cc
16. Crypton Original Novatos
17. Disegraf Crypton Recreativa RPDD
18. Boxer CT 100 Recreativa RPDD
19. Nkd 125 / Tvs 125 4T Recreativa RPDD
20. 150cc 4T Stock Multimarca Recreativa RPDD
21. 200 4T Stock Multimarca No Slick Recreativa RPDD
22. Libre pilotos afiliados liga del Cauca
23. Alto Cilindraje mas de 300cc
24. Karts
25. Liquimoly Popayan Sin experiencia
26. Liqui Moly Popayán con experiencia
27. Fórmula Colombia Liquimoly motos carenadas
28. Veloarena Infantil hasta 11 años
29. Veloarena adultos libre cilindrada
30. Motocross infantil hasta 11 años
31. Motocross Adultos Libre cilindrada

## 🔧 Tecnologías Utilizadas

**Frontend:**
- React 19
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (iconos)
- Fuentes: Oxanium & Space Grotesk

**Backend:**
- FastAPI
- MongoDB (Motor - async driver)
- JWT Authentication
- Bcrypt para passwords
- Pydantic para validación

## 📝 Endpoints API Principales

### Públicos
- `GET /api/` - Info de la API
- `GET /api/categories` - Obtener categorías y precios
- `POST /api/registrations/calculate` - Calcular precio de inscripción
- `POST /api/registrations` - Crear inscripción
- `POST /api/coupons/validate` - Validar cupón
- `GET /api/news` - Obtener noticias

### Admin (requiere autenticación)
- `POST /api/admin/login` - Login
- `POST /api/admin/register` - Registrar nuevo admin
- `GET /api/registrations` - Listar inscripciones
- `POST /api/admin/coupons` - Crear cupón
- `GET /api/admin/coupons` - Listar cupones
- `POST /api/admin/news` - Publicar noticia

## 🎯 Sistema de Precios

### Fases de Inscripción
1. **Preventa** (hasta 31 enero)
   - 15% de descuento sobre precio base

2. **Ordinaria** (febrero)
   - Precio normal

3. **Extraordinaria** (después de febrero)
   - +20% sobre precio base

### Cupones de Descuento
- **30%** - Descuento moderado
- **50%** - Descuento medio
- **100%** - Inscripción gratuita

## 📅 Calendario del Evento

**Jueves 20 de Febrero 2026**
- 08:00 - 12:00: Aguapanelazo (Acreditación)
- 13:00 - 18:00: Entrenamientos libres

**Viernes 21 de Febrero 2026**
- 08:00 - 12:00: Entrenamientos Reconocimientos 2025
- 13:00 - 18:00: Carreras Clasificatorias

**Sábado 22 de Febrero 2026**
- 08:00 - 14:00: CARRERAS FINALES
- 15:00 - 17:00: Ceremonia de Premiación

## 📍 Ubicación

**Corona Club XP**
Avenida Panamericana, KM 9 El Cofre
Popayán, Cauca - Colombia

---

**Nota:** Esta es una aplicación de demostración. Para producción se recomienda:
1. Cambiar las credenciales de administrador
2. Configurar certificados SSL
3. Implementar integración real con MercadoPago
4. Agregar sistema de backups para la base de datos
5. Configurar rate limiting en el backend
