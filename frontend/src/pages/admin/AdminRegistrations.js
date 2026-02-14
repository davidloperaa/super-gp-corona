import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Download } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchRegistrations(token);
  }, [navigate]);

  const fetchRegistrations = async (token) => {
    try {
      const response = await axios.get(`${API}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
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
          <div className="flex justify-between items-center mb-12">
            <h1 className="font-heading text-5xl font-black uppercase text-glow-red" data-testid="registrations-title">
              INSCRIPCIONES
            </h1>
            <button
              className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors"
              data-testid="btn-exportar"
            >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </div>

        <div className="bg-surface border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-white/70 text-sm mb-1">Total Inscripciones</p>
              <p className="font-heading text-3xl font-black text-primary">{registrations.length}</p>
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

        <div className="overflow-x-auto">
          <table className="w-full bg-surface border border-white/10">
            <thead className="bg-black/50">
              <tr className="font-heading uppercase text-sm">
                <th className="px-4 py-3 text-left">Piloto</th>
                <th className="px-4 py-3 text-left">Cédula</th>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Celular</th>
                <th className="px-4 py-3 text-left">Categorías</th>
                <th className="px-4 py-3 text-right">Precio Final</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, index) => (
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
                    <span className="text-xs bg-surface border border-secondary px-2 py-1">
                      {reg.categorias?.length || 0} cat.
                    </span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};
