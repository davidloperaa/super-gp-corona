import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Save } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminPrecios = () => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchPrices(token);
  }, [navigate]);

  const fetchPrices = async (token) => {
    try {
      const response = await axios.get(`${API}/admin/category-prices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrices(response.data.prices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (categoria, value) => {
    setPrices((prev) => ({
      ...prev,
      [categoria]: parseFloat(value) || 0,
    }));
  };

  const handleSavePrice = async (categoria) => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      await axios.put(
        `${API}/admin/category-price`,
        {
          categoria: categoria,
          precio: prices[categoria],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Precio de ${categoria} actualizado exitosamente`);
    } catch (error) {
      alert('Error al actualizar precio');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    let savedCount = 0;
    let errorCount = 0;

    try {
      // Save prices sequentially to avoid conflicts
      for (const categoria of Object.keys(prices)) {
        try {
          await axios.put(
            `${API}/admin/category-price`,
            { categoria, precio: prices[categoria] },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          savedCount++;
        } catch (err) {
          console.error(`Error saving ${categoria}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount === 0) {
        alert(`Todos los precios (${savedCount}) actualizados exitosamente`);
      } else {
        alert(`Se guardaron ${savedCount} precios. ${errorCount} fallaron.`);
      }
    } catch (error) {
      alert('Error al actualizar precios');
    } finally {
      setSaving(false);
    }
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
      <AdminNavbar title="Gestionar Precios" />
      <div className="min-h-screen pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="font-heading text-5xl font-black uppercase text-glow-red" data-testid="precios-title">
              GESTIONAR PRECIOS
            </h1>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              data-testid="btn-guardar-todos"
              className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : 'Guardar Todos'}</span>
            </button>
          </div>

        <div className="bg-surface border border-white/10 p-6 mb-8">
          <p className="text-white/80">
            Actualiza los precios de las categorías de forma individual o guarda todos a la vez.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(prices).sort().map((categoria, index) => (
            <div
              key={index}
              data-testid={`precio-card-${index}`}
              className="bg-surface border border-white/10 p-6 hover:border-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>

              <h3 className="font-heading font-bold uppercase mb-4 text-sm">{categoria}</h3>

              <div className="flex space-x-2">
                <input
                  type="number"
                  data-testid={`input-precio-${index}`}
                  value={prices[categoria]}
                  onChange={(e) => handlePriceChange(categoria, e.target.value)}
                  className="flex-1 bg-black/50 border border-white/20 focus:border-secondary text-white h-10 px-3 outline-none"
                />
                <button
                  onClick={() => handleSavePrice(categoria)}
                  disabled={saving}
                  className="bg-primary text-white px-4 hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
