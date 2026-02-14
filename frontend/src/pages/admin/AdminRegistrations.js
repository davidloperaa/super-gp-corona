import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Download, Filter, CheckCircle, XCircle, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllType, setDeleteAllType] = useState(null); // 'all', 'pendiente', 'completado'

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const [regResponse, catResponse] = await Promise.all([
        axios.get(`${API}/registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/categories`)
      ]);
      setRegistrations(regResponse.data.registrations || []);
      setCategories(catResponse.data.categorias || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (registrationId, newStatus) => {
    setUpdatingStatus(registrationId);
    const token = localStorage.getItem('admin_token');
    
    try {
      await axios.put(
        `${API}/admin/registrations/${registrationId}/status`,
        { estado_pago: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, estado_pago: newStatus }
            : reg
        )
      );
      
      alert(`Estado actualizado a ${newStatus}`);
    } catch (error) {
      alert('Error al actualizar estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const categoryMatch = selectedCategory === 'all' || 
      reg.categorias?.includes(selectedCategory);
    const statusMatch = statusFilter === 'all' || 
      reg.estado_pago === statusFilter;
    return categoryMatch && statusMatch;
  });

  // Get unique categories from registrations
  const usedCategories = [...new Set(registrations.flatMap(r => r.categorias || []))];

  // Export to CSV
  const exportToCSV = (data, filename) => {
    const headers = ['Nombre', 'Apellido', 'Cédula', 'Número', 'Correo', 'Celular', 'Categorías', 'Precio', 'Estado', 'Fecha'];
    const rows = data.map(reg => [
      reg.nombre,
      reg.apellido,
      reg.cedula,
      reg.numero_competicion,
      reg.correo,
      reg.celular,
      (reg.categorias || []).join('; '),
      reg.precio_final || 0,
      reg.estado_pago,
      formatDate(reg.created_at)
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const handleExportAll = () => {
    exportToCSV(registrations, 'inscripciones_todas');
  };

  const handleExportFiltered = () => {
    const suffix = selectedCategory !== 'all' ? `_${selectedCategory.replace(/\s+/g, '_')}` : '';
    const statusSuffix = statusFilter !== 'all' ? `_${statusFilter}` : '';
    exportToCSV(filteredRegistrations, `inscripciones${suffix}${statusSuffix}`);
  };

  const handleExportByCategory = (category) => {
    const categoryRegs = registrations.filter(r => r.categorias?.includes(category));
    exportToCSV(categoryRegs, `inscripciones_${category.replace(/\s+/g, '_')}`);
  };

  const handleExportAllByCategory = () => {
    usedCategories.forEach(category => {
      setTimeout(() => handleExportByCategory(category), 100);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar title="Inscripciones" />
      <div className="min-h-screen pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-black uppercase text-glow-red" data-testid="registrations-title">
              INSCRIPCIONES
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportAll}
                className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-4 py-2 hover:bg-secondary/80 transition-colors text-sm"
                data-testid="btn-exportar-todo"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Todo</span>
              </button>
              <button
                onClick={handleExportFiltered}
                className="flex items-center space-x-2 bg-primary text-white font-heading font-bold uppercase px-4 py-2 hover:bg-primary/80 transition-colors text-sm"
                data-testid="btn-exportar-filtrado"
              >
                <Filter className="w-4 h-4" />
                <span>Exportar Filtrado</span>
              </button>
              <button
                onClick={handleExportAllByCategory}
                className="flex items-center space-x-2 bg-accent text-black font-heading font-bold uppercase px-4 py-2 hover:bg-accent/80 transition-colors text-sm"
                data-testid="btn-exportar-categorias"
              >
                <Download className="w-4 h-4" />
                <span>Exportar x Categoría</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-surface border border-white/10 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-white/70 text-sm mb-1">Total Inscripciones</p>
                <p className="font-heading text-3xl font-black text-primary">{registrations.length}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Mostrando</p>
                <p className="font-heading text-3xl font-black text-accent">{filteredRegistrations.length}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Pagos Pendientes</p>
                <p className="font-heading text-3xl font-black text-warning">
                  {registrations.filter((r) => r.estado_pago === 'pendiente').length}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Pagos Completados</p>
                <p className="font-heading text-3xl font-black text-secondary">
                  {registrations.filter((r) => r.estado_pago === 'completado').length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-surface border border-white/10 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-white/70 text-sm mb-2">Filtrar por Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 text-white h-10 px-3 outline-none focus:border-secondary"
                  data-testid="filter-category"
                >
                  <option value="all">Todas las categorías</option>
                  {usedCategories.sort().map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-white/70 text-sm mb-2">Filtrar por Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 text-white h-10 px-3 outline-none focus:border-secondary"
                  data-testid="filter-status"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export by individual category */}
          {usedCategories.length > 0 && (
            <div className="bg-surface border border-white/10 p-4 mb-6">
              <p className="text-white/70 text-sm mb-3">Exportar por categoría individual:</p>
              <div className="flex flex-wrap gap-2">
                {usedCategories.sort().map((cat, idx) => {
                  const count = registrations.filter(r => r.categorias?.includes(cat)).length;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleExportByCategory(cat)}
                      className="text-xs bg-black/50 border border-white/20 px-3 py-1 hover:border-secondary hover:text-secondary transition-colors"
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-surface border border-white/10">
              <thead className="bg-black/50">
                <tr className="font-heading uppercase text-sm">
                  <th className="px-4 py-3 text-left">Piloto</th>
                  <th className="px-4 py-3 text-left">Cédula</th>
                  <th className="px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Celular</th>
                  <th className="px-4 py-3 text-left">Categorías</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, index) => (
                  <tr
                    key={reg.id}
                    data-testid={`registration-row-${index}`}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold">{reg.nombre} {reg.apellido}</p>
                        <p className="text-xs text-white/70">{reg.correo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{reg.cedula}</td>
                    <td className="px-4 py-3">
                      <span className="font-heading font-black text-primary">#{reg.numero_competicion}</span>
                    </td>
                    <td className="px-4 py-3 text-white/70">{reg.celular}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {reg.categorias?.map((cat, idx) => (
                          <span key={idx} className="text-xs bg-black/50 border border-secondary/50 px-2 py-0.5">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-heading font-bold">
                      COP {(reg.precio_final || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs uppercase font-heading font-bold px-2 py-1 ${
                          reg.estado_pago === 'completado'
                            ? 'bg-secondary text-black'
                            : 'bg-warning text-black'
                        }`}
                      >
                        {reg.estado_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm">
                      {formatDate(reg.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {updatingStatus === reg.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto text-white/50" />
                      ) : reg.estado_pago === 'pendiente' ? (
                        <button
                          onClick={() => handleUpdateStatus(reg.id, 'completado')}
                          className="p-1 bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                          title="Marcar como completado"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(reg.id, 'pendiente')}
                          className="p-1 bg-warning/20 text-warning hover:bg-warning/30 transition-colors"
                          title="Marcar como pendiente"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-white/50">
              No hay inscripciones que coincidan con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
