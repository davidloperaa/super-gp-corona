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

  const handleDeleteRegistration = async (registrationId, pilotoNombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la inscripción de ${pilotoNombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setDeletingId(registrationId);
    const token = localStorage.getItem('admin_token');
    
    try {
      await axios.delete(
        `${API}/admin/registrations/${registrationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
      alert('Inscripción eliminada exitosamente');
    } catch (error) {
      alert('Error al eliminar inscripción');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async (type) => {
    const token = localStorage.getItem('admin_token');
    
    try {
      let url = `${API}/admin/registrations`;
      let message = '';
      
      if (type === 'all') {
        message = `Se eliminarán TODAS las ${registrations.length} inscripciones`;
      } else {
        url = `${API}/admin/registrations/status/${type}`;
        const count = registrations.filter(r => r.estado_pago === type).length;
        message = `Se eliminarán ${count} inscripciones con estado "${type}"`;
      }
      
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.message);
      
      // Refresh data
      fetchData(token);
    } catch (error) {
      alert('Error al eliminar inscripciones');
    } finally {
      setShowDeleteAllModal(false);
      setDeleteAllType(null);
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

  // Map internal status to human-readable label
  const statusLabel = (s) => ({
    pendiente: 'Pendiente',
    pendiente_verificacion: 'Pendiente por verificar',
    completado: 'Confirmado',
  }[s] || s || '');

  // Export to CSV
  const exportToCSV = (data, filename) => {
    const headers = ['Nombre', 'Apellido', 'Cédula', 'Número', 'Correo', 'Celular', 'Liga', 'Categorías', 'Precio', 'Estado', 'Adjuntó comprobante', 'URL Comprobante', 'Fecha'];
    const rows = data.map(reg => [
      reg.nombre,
      reg.apellido,
      reg.cedula,
      reg.numero_competicion,
      reg.correo,
      reg.celular,
      reg.liga || '',
      (reg.categorias || []).join('; '),
      reg.precio_final || 0,
      statusLabel(reg.estado_pago),
      reg.tiene_comprobante ? 'Sí' : 'No',
      reg.comprobante_url ? `${BACKEND_URL}${reg.comprobante_url}` : '',
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
              <button
                onClick={() => { setDeleteAllType('pendiente'); setShowDeleteAllModal(true); }}
                className="flex items-center space-x-2 bg-warning text-black font-heading font-bold uppercase px-4 py-2 hover:bg-warning/80 transition-colors text-sm"
                data-testid="btn-eliminar-pendientes"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Pendientes</span>
              </button>
              <button
                onClick={() => { setDeleteAllType('all'); setShowDeleteAllModal(true); }}
                className="flex items-center space-x-2 bg-red-600 text-white font-heading font-bold uppercase px-4 py-2 hover:bg-red-700 transition-colors text-sm"
                data-testid="btn-eliminar-todo"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Todo</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-surface border border-white/10 p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <p className="text-white/70 text-sm mb-1">Total</p>
                <p className="font-heading text-3xl font-black text-primary">{registrations.length}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Mostrando</p>
                <p className="font-heading text-3xl font-black text-accent">{filteredRegistrations.length}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Pendientes</p>
                <p className="font-heading text-3xl font-black" style={{ color: '#F97316' }}>
                  {registrations.filter((r) => r.estado_pago === 'pendiente').length}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Por Verificar</p>
                <p className="font-heading text-3xl font-black text-warning">
                  {registrations.filter((r) => r.estado_pago === 'pendiente_verificacion').length}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Confirmados</p>
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
                  <option value="pendiente_verificacion">Pendiente por verificar</option>
                  <option value="completado">Confirmado</option>
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
                  <th className="px-4 py-3 text-left">Liga</th>
                  <th className="px-4 py-3 text-left">Categorías</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Comprobante</th>
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
                    <td className="px-4 py-3 text-white/70">{reg.liga || '-'}</td>
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
                      {(() => {
                        const map = {
                          pendiente: { label: 'Pendiente', bg: '#F97316', fg: '#000' },
                          pendiente_verificacion: { label: 'Por verificar', bg: '#EAB308', fg: '#000' },
                          completado: { label: 'Confirmado', bg: '#10B981', fg: '#000' },
                        };
                        const s = map[reg.estado_pago] || { label: reg.estado_pago, bg: '#6B7280', fg: '#fff' };
                        return (
                          <span
                            className="text-xs uppercase font-heading font-bold px-2 py-1 whitespace-nowrap"
                            style={{ backgroundColor: s.bg, color: s.fg }}
                          >
                            {s.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.tiene_comprobante && reg.comprobante_url ? (
                        <a
                          href={`${BACKEND_URL}${reg.comprobante_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs uppercase font-heading font-bold text-secondary hover:text-secondary/80 underline"
                          data-testid={`btn-ver-comprobante-${reg.id}`}
                          title={reg.comprobante_filename || 'Ver comprobante'}
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="text-xs text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm">
                      {formatDate(reg.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {updatingStatus === reg.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white/50" />
                        ) : (
                          <>
                            {/* "Confirmar" — visible si NO está confirmado */}
                            {reg.estado_pago !== 'completado' && (
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'completado')}
                                className="p-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                title="Confirmar pago (envía email al piloto)"
                                data-testid={`btn-confirmar-${reg.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* "Marcar Por verificar" — visible si tiene comprobante y NO está ya en ese estado */}
                            {reg.tiene_comprobante && reg.estado_pago !== 'pendiente_verificacion' && (
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'pendiente_verificacion')}
                                className="p-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                                title="Marcar como pendiente por verificar"
                                data-testid={`btn-verificar-${reg.id}`}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                            {/* "Pendiente" — revertir */}
                            {reg.estado_pago !== 'pendiente' && (
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'pendiente')}
                                className="p-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                                title="Marcar como pendiente"
                                data-testid={`btn-pendiente-${reg.id}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {deletingId === reg.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <button
                            onClick={() => handleDeleteRegistration(reg.id, `${reg.nombre} ${reg.apellido}`)}
                            className="p-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                            title="Eliminar inscripción"
                            data-testid={`btn-delete-${reg.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="font-heading text-xl font-bold uppercase text-red-500">
                ¡ADVERTENCIA!
              </h3>
            </div>
            
            <p className="text-white mb-4">
              {deleteAllType === 'all' 
                ? `¿Estás seguro de eliminar TODAS las ${registrations.length} inscripciones? Esta acción NO se puede deshacer.`
                : `¿Estás seguro de eliminar todas las inscripciones con estado "${deleteAllType}"? Esta acción NO se puede deshacer.`
              }
            </p>
            
            <p className="text-warning text-sm mb-6">
              Se recomienda exportar los datos antes de eliminar.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowDeleteAllModal(false); setDeleteAllType(null); }}
                className="flex-1 bg-white/10 text-white font-heading font-bold uppercase px-4 py-3 hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteAll(deleteAllType)}
                className="flex-1 bg-red-600 text-white font-heading font-bold uppercase px-4 py-3 hover:bg-red-700 transition-colors"
                data-testid="btn-confirm-delete"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
