import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Ticket } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminCoupons = () => {
  const navigate = useNavigate();
  const [cupones, setCupones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    tipo_descuento: 30,
    usos_maximos: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCupones(token);
  }, [navigate]);

  const fetchCupones = async (token) => {
    try {
      const response = await axios.get(`${API}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCupones(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    try {
      await axios.post(
        `${API}/admin/coupons`,
        {
          codigo: formData.codigo.toUpperCase(),
          tipo_descuento: parseInt(formData.tipo_descuento),
          usos_maximos: formData.usos_maximos ? parseInt(formData.usos_maximos) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Cupón creado exitosamente');
      setFormData({ codigo: '', tipo_descuento: 30, usos_maximos: '' });
      setShowForm(false);
      fetchCupones(token);
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al crear cupón');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-heading text-5xl font-black uppercase text-glow-red" data-testid="cupones-title">
            CUPONES
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            data-testid="btn-nuevo-cupon"
            className="flex items-center space-x-2 bg-primary text-white font-heading font-bold uppercase px-6 py-3 hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Cupón</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-surface border border-white/10 p-8 mb-8" data-testid="form-cupon">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6">Crear Nuevo Cupón</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Código *</label>
                <input
                  type="text"
                  data-testid="input-codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-heading font-bold mb-2">Tipo Descuento *</label>
                <select
                  data-testid="select-descuento"
                  value={formData.tipo_descuento}
                  onChange={(e) => setFormData({ ...formData, tipo_descuento: e.target.value })}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                >
                  <option value="30">30%</option>
                  <option value="50">50%</option>
                  <option value="100">100%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-heading font-bold mb-2">Usos Máximos (Opcional)</label>
                <input
                  type="number"
                  data-testid="input-usos-maximos"
                  value={formData.usos_maximos}
                  onChange={(e) => setFormData({ ...formData, usos_maximos: e.target.value })}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                data-testid="btn-crear-cupon"
                className="bg-primary text-white font-heading font-bold uppercase px-8 py-3 hover:bg-primary/80 transition-colors"
              >
                Crear Cupón
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-surface text-white font-heading font-bold uppercase px-8 py-3 border border-white/20 hover:border-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cupones.map((cupon, index) => (
            <div
              key={cupon.id}
              data-testid={`cupon-card-${index}`}
              className="bg-surface border border-white/10 p-6 hover:border-secondary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <Ticket className="w-8 h-8 text-secondary" />
                <span
                  className={`text-xs uppercase font-heading font-bold px-2 py-1 ${
                    cupon.activo ? 'bg-secondary text-black' : 'bg-white/20'
                  }`}
                >
                  {cupon.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <h3 className="font-heading text-2xl font-black uppercase mb-2 text-secondary">{cupon.codigo}</h3>

              <div className="space-y-2 text-sm">
                <p className="text-white/70">
                  Descuento: <span className="text-white font-bold">{cupon.tipo_descuento}%</span>
                </p>
                <p className="text-white/70">
                  Usos: <span className="text-white font-bold">
                    {cupon.usos_actuales} / {cupon.usos_maximos || '∞'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
