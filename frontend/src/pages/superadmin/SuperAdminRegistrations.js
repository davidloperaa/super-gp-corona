import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, ArrowLeft, Search, Download, Users,
  DollarSign, CheckCircle, Clock, XCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const SuperAdminRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('super_admin_token');
    if (!token) {
      navigate('/superadmin/login');
      return;
    }
    fetchRegistrations();
  }, [navigate]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('super_admin_token');
      const response = await axios.get(`${API}/superadmin/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data.registrations);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('super_admin_token');
        navigate('/superadmin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.nombre?.toLowerCase().includes(term) ||
        reg.apellido?.toLowerCase().includes(term) ||
        reg.correo?.toLowerCase().includes(term) ||
        reg.cedula?.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.estado_pago === statusFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      completado: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle, label: 'Completado' },
      pendiente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock, label: 'Pendiente' },
      fallido: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Fallido' }
    };
    const badge = badges[status] || badges.pendiente;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        <span>{badge.label}</span>
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Apellido', 'Email', 'Cédula', 'Total', 'Comisión', 'Neto Evento', 'Estado', 'Fecha'];
    const rows = filteredRegistrations.map(reg => [
      reg.nombre,
      reg.apellido,
      reg.correo,
      reg.cedula,
      reg.precio_final,
      reg.comision_plataforma || 0,
      reg.neto_evento || reg.precio_final,
      reg.estado_pago,
      new Date(reg.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registros_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Calculate totals
  const totals = filteredRegistrations.reduce((acc, reg) => {
    if (reg.estado_pago === 'completado') {
      acc.revenue += reg.precio_final || 0;
      acc.commission += reg.comision_plataforma || 0;
      acc.netToEvent += reg.neto_evento || reg.precio_final || 0;
      acc.completed += 1;
    }
    return acc;
  }, { revenue: 0, commission: 0, netToEvent: 0, completed: 0 });

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
      <header className="bg-black/40 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-white">Todos los Registros</span>
          </div>
          <Link 
            to="/superadmin/dashboard"
            className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Registros Pagados</p>
            <p className="text-2xl font-bold text-white">{totals.completed}</p>
          </div>
          <div className="bg-black/40 border border-green-500/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totals.revenue)}</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Comisiones</p>
            <p className="text-2xl font-bold text-purple-400">{formatCurrency(totals.commission)}</p>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Neto a Eventos</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totals.netToEvent)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o cédula..."
              className="w-full bg-black/40 border border-gray-700 text-white pl-11 pr-4 py-3 rounded-lg focus:border-purple-500 focus:outline-none"
              data-testid="search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:outline-none"
            data-testid="status-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="completado">Completados</option>
            <option value="pendiente">Pendientes</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            data-testid="export-btn"
          >
            <Download className="w-5 h-5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-black/40 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-sm">Inscrito</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-sm">Email</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3 text-sm">Total</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3 text-sm">Comisión</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3 text-sm">Neto Evento</th>
                  <th className="text-center text-gray-400 font-medium px-4 py-3 text-sm">Estado</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3 text-sm">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-8">
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{reg.nombre} {reg.apellido}</p>
                          <p className="text-gray-500 text-xs">{reg.cedula}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{reg.correo}</td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        {formatCurrency(reg.precio_final)}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-400">
                        {formatCurrency(reg.comision_plataforma || 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-400">
                        {formatCurrency(reg.neto_evento || reg.precio_final)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(reg.estado_pago)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-sm">
                        {new Date(reg.created_at).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Mostrando {filteredRegistrations.length} de {registrations.length} registros
        </p>
      </main>
    </div>
  );
};
