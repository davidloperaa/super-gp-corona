import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Palette, Image, Calendar, Link as LinkIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminConfiguracion = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('¡Configuración guardada exitosamente!');
    } catch (error) {
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen pt-32 flex items-center justify-center\">
        <div className=\"animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary\"></div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen pt-32 pb-24\">
      <div className=\"max-w-6xl mx-auto px-4 sm:px-6 lg:px-8\">
        <div className=\"flex justify-between items-center mb-12\">
          <h1 className=\"font-heading text-5xl font-black uppercase text-glow-red\" data-testid=\"configuracion-title\">
            CONFIGURACIÓN
          </h1>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className=\"flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50\"
          >
            <Save className=\"w-5 h-5\" />
            <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
          </button>
        </div>

        <div className=\"space-y-8\">
          {/* Marca y Logo */}
          <div className=\"bg-surface border border-white/10 p-6\">
            <div className=\"flex items-center space-x-3 mb-6\">
              <Image className=\"w-6 h-6 text-primary\" />
              <h2 className=\"font-heading text-2xl font-bold uppercase\">Marca y Logo</h2>
            </div>
            <div className=\"space-y-4\">
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">URL del Logo</label>
                <input
                  type=\"url\"
                  value={settings.logo_url || ''}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder=\"https://ejemplo.com/logo.png\"
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              {settings.logo_url && (
                <div className=\"border border-white/20 p-4\">
                  <p className=\"text-sm text-white/70 mb-2\">Vista previa:</p>
                  <img src={settings.logo_url} alt=\"Logo\" className=\"h-16 object-contain\" />
                </div>
              )}
            </div>
          </div>

          {/* Colores del Tema */}
          <div className=\"bg-surface border border-white/10 p-6\">
            <div className=\"flex items-center space-x-3 mb-6\">
              <Palette className=\"w-6 h-6 text-secondary\" />
              <h2 className=\"font-heading text-2xl font-bold uppercase\">Colores del Tema</h2>
            </div>
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Color Primario</label>
                <div className=\"flex space-x-2\">
                  <input
                    type=\"color\"
                    value={settings.primary_color || '#FF0000'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className=\"h-12 w-20\"
                  />
                  <input
                    type=\"text\"
                    value={settings.primary_color || '#FF0000'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className=\"flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none\"
                  />
                </div>
              </div>

              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Color Secundario</label>
                <div className=\"flex space-x-2\">
                  <input
                    type=\"color\"
                    value={settings.secondary_color || '#00CED1'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className=\"h-12 w-20\"
                  />
                  <input
                    type=\"text\"
                    value={settings.secondary_color || '#00CED1'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className=\"flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none\"
                  />
                </div>
              </div>

              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Color Acento</label>
                <div className=\"flex space-x-2\">
                  <input
                    type=\"color\"
                    value={settings.accent_color || '#E6007E'}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className=\"h-12 w-20\"
                  />
                  <input
                    type=\"text\"
                    value={settings.accent_color || '#E6007E'}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className=\"flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none\"
                  />
                </div>
              </div>

              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Fondo</label>
                <div className=\"flex space-x-2\">
                  <input
                    type=\"color\"
                    value={settings.background_color || '#050505'}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className=\"h-12 w-20\"
                  />
                  <input
                    type=\"text\"
                    value={settings.background_color || '#050505'}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className=\"flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none\"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className=\"bg-surface border border-white/10 p-6\">
            <h2 className=\"font-heading text-2xl font-bold uppercase mb-6\">Hero Section</h2>
            <div className=\"space-y-4\">
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Título Principal</label>
                <input
                  type=\"text\"
                  value={settings.hero_title || ''}
                  onChange={(e) => handleChange('hero_title', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Subtítulo</label>
                <input
                  type=\"text\"
                  value={settings.hero_subtitle || ''}
                  onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Descripción</label>
                <textarea
                  value={settings.hero_description || ''}
                  onChange={(e) => handleChange('hero_description', e.target.value)}
                  rows={3}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white px-4 py-3 outline-none resize-none\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Imagen de Fondo (URL)</label>
                <input
                  type=\"url\"
                  value={settings.hero_image_url || ''}
                  onChange={(e) => handleChange('hero_image_url', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
            </div>
          </div>

          {/* Fechas del Evento */}
          <div className=\"bg-surface border border-white/10 p-6\">
            <div className=\"flex items-center space-x-3 mb-6\">
              <Calendar className=\"w-6 h-6 text-warning\" />
              <h2 className=\"font-heading text-2xl font-bold uppercase\">Fechas del Evento</h2>
            </div>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Fecha de Inicio</label>
                <input
                  type=\"text\"
                  value={settings.event_start_date || ''}
                  onChange={(e) => handleChange('event_start_date', e.target.value)}
                  placeholder=\"20 de Febrero 2026\"
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Fecha de Fin</label>
                <input
                  type=\"text\"
                  value={settings.event_end_date || ''}
                  onChange={(e) => handleChange('event_end_date', e.target.value)}
                  placeholder=\"22 de Febrero 2026\"
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              <div className=\"md:col-span-2\">
                <label className=\"block text-sm font-heading font-bold mb-2\">Ubicación</label>
                <input
                  type=\"text\"
                  value={settings.event_location || ''}
                  onChange={(e) => handleChange('event_location', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className=\"bg-surface border border-white/10 p-6\">
            <h2 className=\"font-heading text-2xl font-bold uppercase mb-6\">Footer</h2>
            <div className=\"space-y-4\">
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Texto del Footer</label>
                <input
                  type=\"text\"
                  value={settings.footer_text || ''}
                  onChange={(e) => handleChange('footer_text', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                <div>
                  <label className=\"block text-sm font-heading font-bold mb-2\">Email</label>
                  <input
                    type=\"email\"
                    value={settings.footer_email || ''}
                    onChange={(e) => handleChange('footer_email', e.target.value)}
                    className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-heading font-bold mb-2\">Teléfono</label>
                  <input
                    type=\"tel\"
                    value={settings.footer_phone || ''}
                    onChange={(e) => handleChange('footer_phone', e.target.value)}
                    className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-heading font-bold mb-2\">Dirección</label>
                  <input
                    type=\"text\"
                    value={settings.footer_address || ''}
                    onChange={(e) => handleChange('footer_address', e.target.value)}
                    className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className=\"bg-surface border border-white/10 p-6\">
            <div className=\"flex items-center space-x-3 mb-6\">
              <LinkIcon className=\"w-6 h-6 text-accent\" />
              <h2 className=\"font-heading text-2xl font-bold uppercase\">Redes Sociales</h2>
            </div>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Instagram</label>
                <input
                  type=\"url\"
                  value={settings.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-heading font-bold mb-2\">Facebook</label>
                <input
                  type=\"url\"
                  value={settings.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className=\"w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none\"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className=\"w-full bg-primary text-white font-heading font-black uppercase px-8 py-4 hover:bg-primary/80 transition-colors disabled:opacity-50\"
          >
            {saving ? 'Guardando...' : 'Guardar Toda la Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};
