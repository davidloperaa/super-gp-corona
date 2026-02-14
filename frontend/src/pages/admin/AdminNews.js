import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminNews = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    imagen_url: '',
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('admin_token');

    try {
      await axios.post(
        `${API}/admin/news`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Noticia publicada exitosamente');
      setFormData({ titulo: '', contenido: '', imagen_url: '' });
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al publicar noticia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-5xl font-black uppercase text-glow-red mb-12" data-testid="news-title">
          PUBLICAR NOTICIA
        </h1>

        <form onSubmit={handleSubmit} className="bg-surface border border-white/10 p-8" data-testid="form-noticia">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-heading font-bold mb-2">Título *</label>
              <input
                type="text"
                data-testid="input-titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-bold mb-2">Contenido *</label>
              <textarea
                data-testid="textarea-contenido"
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                rows={10}
                className="w-full bg-black/50 border border-white/20 focus:border-primary text-white px-4 py-3 outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-bold mb-2">URL de Imagen (Opcional)</label>
              <input
                type="url"
                data-testid="input-imagen-url"
                value={formData.imagen_url}
                onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
              />
            </div>

            {formData.imagen_url && (
              <div>
                <p className="text-sm font-heading font-bold mb-2">Vista Previa</p>
                <img
                  src={formData.imagen_url}
                  alt="Preview"
                  className="w-full max-h-64 object-cover border border-white/20"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="btn-publicar"
              className="flex items-center space-x-2 bg-primary text-white font-heading font-black uppercase px-8 py-4 hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>{loading ? 'Publicando...' : 'Publicar Noticia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
