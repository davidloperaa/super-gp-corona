import '@/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Categorias } from './pages/Categorias';
import { Calendario } from './pages/Calendario';
import { Galeria } from './pages/Galeria';
import { Inscripcion } from './pages/Inscripcion';
import { Noticias } from './pages/Noticias';
import { PagoExitoso } from './pages/PagoExitoso';
import { PagoFallido } from './pages/PagoFallido';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRegistrations } from './pages/admin/AdminRegistrations';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminPrecios } from './pages/admin/AdminPrecios';
import { AdminCategorias } from './pages/admin/AdminCategorias';
import { AdminContenido } from './pages/admin/AdminContenido';
import { AdminConfiguracion } from './pages/admin/AdminConfiguracion';
import { AdminAsistencia } from './pages/admin/AdminAsistencia';
import { AdminGaleria } from './pages/admin/AdminGaleria';
import { AdminCalendario } from './pages/admin/AdminCalendario';
// Super Admin pages
import { SuperAdminLogin } from './pages/superadmin/SuperAdminLogin';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { SuperAdminConfig } from './pages/superadmin/SuperAdminConfig';
import { SuperAdminMercadoPago } from './pages/superadmin/SuperAdminMercadoPago';
import { SuperAdminRegistrations } from './pages/superadmin/SuperAdminRegistrations';

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        <BrowserRouter>
          <Navbar />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/inscripcion" element={<Inscripcion />} />
          <Route path="/inscripciones" element={<Inscripcion />} />
          <Route path="/noticias" element={<Noticias />} />
          
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/pago-fallido" element={<PagoFallido />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/precios" element={<AdminPrecios />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
          <Route path="/admin/contenido" element={<AdminContenido />} />
          <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
          <Route path="/admin/asistencia" element={<AdminAsistencia />} />
          <Route path="/admin/galeria" element={<AdminGaleria />} />
          <Route path="/admin/calendario" element={<AdminCalendario />} />
          
          {/* Super Admin Routes */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/config" element={<SuperAdminConfig />} />
          <Route path="/superadmin/mercadopago" element={<SuperAdminMercadoPago />} />
          <Route path="/superadmin/registrations" element={<SuperAdminRegistrations />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
    </SettingsProvider>
  );
}

export default App;
