import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, DollarSign, Settings, Users, LogOut, 
  TrendingUp, Percent, CreditCard, Building2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('super_admin_token');
    if (!token) {
      navigate('/superadmin/login');
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('super_admin_token');
      const response = await axios.get(`${API}/superadmin/commission-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('super_admin_token');
        navigate('/superadmin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('super_admin_token');
    navigate('/superadmin/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-white">Super Admin</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link 
              to="/superadmin/config" 
              className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </Link>
            <Link 
              to="/superadmin/registrations" 
              className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Registros</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Panel de Control</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.total_registrations || 0}</p>
            <p className="text-purple-300 text-sm mt-1">Inscripciones Completadas</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats?.total_revenue)}</p>
            <p className="text-green-300 text-sm mt-1">Ingresos Totales</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Percent className="w-8 h-8 text-yellow-400" />
              <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">
                {stats?.commission_type === 'percentage' 
                  ? `${stats?.commission_value}%` 
                  : formatCurrency(stats?.commission_value)}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats?.total_commission)}</p>
            <p className="text-yellow-300 text-sm mt-1">Comisiones Plataforma</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-blue-400" />
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats?.total_net_to_events)}</p>
            <p className="text-blue-300 text-sm mt-1">Neto a Eventos</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/superadmin/config"
            className="bg-black/40 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all group"
            data-testid="config-link"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500/20 p-4 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Configurar Comisiones</h3>
                <p className="text-gray-400 mt-1">
                  Establece el tipo y valor de comisión para cada inscripción
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/superadmin/mercadopago"
            className="bg-black/40 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all group"
            data-testid="mercadopago-link"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/20 p-4 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Configurar MercadoPago</h3>
                <p className="text-gray-400 mt-1">
                  Gestiona las credenciales de MercadoPago del evento
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-300 mb-2">¿Cómo funcionan las comisiones?</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-purple-400">•</span>
              <span><strong>Porcentaje:</strong> Se calcula un porcentaje del valor total de cada inscripción.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400">•</span>
              <span><strong>Monto Fijo:</strong> Se cobra un valor fijo en pesos por cada inscripción.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400">•</span>
              <span>Las comisiones se calculan automáticamente al momento de crear cada inscripción.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};
