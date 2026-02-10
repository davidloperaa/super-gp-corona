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
import { AdminContenido } from './pages/admin/AdminContenido';
import { AdminConfiguracion } from './pages/admin/AdminConfiguracion';
import { AdminAsistencia } from './pages/admin/AdminAsistencia';

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
          <Route path="/noticias" element={<Noticias />} />
          
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/pago-fallido" element={<PagoFallido />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/precios" element={<AdminPrecios />} />
          <Route path="/admin/contenido" element={<AdminContenido />} />
          <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
          <Route path="/admin/asistencia" element={<AdminAsistencia />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
