import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Ticket, Newspaper, LogOut, DollarSign, Settings, Image } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ registrations: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const response = await axios.get(`${API}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const registrations = response.data.registrations || [];
      const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.precio_final || 0), 0);
      setStats({ registrations: registrations.length, totalRevenue });
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-heading text-5xl font-black uppercase text-glow-red" data-testid="dashboard-title">
            PANEL ADMIN
          </h1>
          <button
            onClick={handleLogout}
            data-testid="btn-logout"
            className="flex items-center space-x-2 bg-surface text-white font-heading font-bold uppercase px-6 py-3 border border-white/20 hover:border-primary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Salir</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface border border-primary/50 p-6" data-testid="stat-inscripciones">
            <Users className="w-10 h-10 text-primary mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Inscripciones</p>
            <p className="font-heading text-4xl font-black text-primary">{stats.registrations}</p>
          </div>

          <div className="bg-surface border border-secondary/50 p-6" data-testid="stat-ingresos">
            <DollarSign className="w-10 h-10 text-secondary mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Ingresos Totales</p>
            <p className="font-heading text-3xl font-black text-secondary">
              COP {stats.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface border border-warning/50 p-6">
            <Ticket className="w-10 h-10 text-warning mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Cupones Activos</p>
            <p className="font-heading text-4xl font-black text-warning">-</p>
          </div>

          <div className="bg-surface border border-accent/50 p-6">
            <Newspaper className="w-10 h-10 text-accent mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Noticias</p>
            <p className="font-heading text-4xl font-black text-accent">-</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/registrations"
            data-testid="link-gestionar-inscripciones"
            className="bg-surface border-2 border-white/10 p-8 hover:border-primary transition-colors group"
          >
            <Users className="w-12 h-12 text-primary mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-primary transition-colors">
              Gestionar Inscripciones
            </h2>
            <p className="text-white/70">Ver y administrar todas las inscripciones del evento</p>
          </Link>

          <Link
            to="/admin/coupons"
            data-testid="link-gestionar-cupones"
            className="bg-surface border-2 border-white/10 p-8 hover:border-secondary transition-colors group"
          >
            <Ticket className="w-12 h-12 text-secondary mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-secondary transition-colors">
              Gestionar Cupones
            </h2>
            <p className="text-white/70">Crear y administrar cupones de descuento</p>
          </Link>

          <Link
            to="/admin/news"
            data-testid="link-gestionar-noticias"
            className="bg-surface border-2 border-white/10 p-8 hover:border-accent transition-colors group"
          >
            <Newspaper className="w-12 h-12 text-accent mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">
              Publicar Noticias
            </h2>
            <p className="text-white/70">Crear y gestionar noticias del evento</p>
          </Link>

          <Link
            to="/admin/precios"
            data-testid="link-gestionar-precios"
            className="bg-surface border-2 border-white/10 p-8 hover:border-warning transition-colors group"
          >
            <DollarSign className="w-12 h-12 text-warning mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-warning transition-colors">
              Gestionar Precios
            </h2>
            <p className="text-white/70">Actualizar precios de categorías</p>
          </Link>

          <Link
            to="/admin/contenido"
            data-testid="link-gestionar-contenido"
            className="bg-surface border-2 border-white/10 p-8 hover:border-secondary transition-colors group"
          >
            <Newspaper className="w-12 h-12 text-secondary mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-secondary transition-colors">
              Gestionar Contenido
            </h2>
            <p className="text-white/70">Editar textos y contenido del sitio</p>
          </Link>

          <Link
            to="/admin/configuracion"
            data-testid="link-configuracion"
            className="bg-surface border-2 border-white/10 p-8 hover:border-accent transition-colors group"
          >
            <Settings className="w-12 h-12 text-accent mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">
              Configuración General
            </h2>
            <p className="text-white/70">Logo, colores, fechas, hero, footer</p>
          </Link>

          <Link
            to="/admin/galeria"
            data-testid="link-galeria"
            className="bg-surface border-2 border-white/10 p-8 hover:border-primary transition-colors group"
          >
            <Image className="w-12 h-12 text-primary mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-primary transition-colors">
              Gestionar Galería
            </h2>
            <p className="text-white/70">Subir y organizar imágenes del evento</p>
          </Link>

          <Link
            to="/admin/asistencia"
            data-testid="link-asistencia"
            className="bg-surface border-2 border-white/10 p-8 hover:border-warning transition-colors group"
          >
            <Users className="w-12 h-12 text-warning mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-warning transition-colors">
              Control de Asistencia
            </h2>
            <p className="text-white/70">Escanear QR y check-in del evento</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
