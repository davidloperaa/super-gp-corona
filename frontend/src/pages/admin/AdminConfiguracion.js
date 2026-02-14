import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Palette, Image, Calendar, Link as LinkIcon, Upload, X, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminConfiguracion = () => {
  const navigate = useNavigate();
  const { settings: contextSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, hero: false });
  const [message, setMessage] = useState({ type: '', text: '' });
  const logoInputRef = useRef(null);
  const heroInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    setSettings(contextSettings);
    setLoading(false);
  }, [navigate, contextSettings]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [type]: true }));
    const token = localStorage.getItem('admin_token');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image_type', type);

      const response = await axios.post(`${API}/admin/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageKey = type === 'logo' ? 'logo_url' : 'hero_image_url';
      handleChange(imageKey, response.data.url);
      setMessage({ type: 'success', text: `Imagen de ${type} subida exitosamente` });
    } catch (error) {
      setMessage({ type: 'error', text: `Error al subir imagen: ${error.response?.data?.detail || error.message}` });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('admin_token');

    try {
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      refreshSettings();
      setMessage({ type: 'success', text: '¡Configuración guardada exitosamente!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar configuración' });
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
      <AdminNavbar title="Configuración General" />
      <div className="min-h-screen pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-black uppercase text-glow-red">
            CONFIGURACIÓN GENERAL
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center space-x-2 bg-surface text-white font-heading font-bold uppercase px-4 py-3 border border-white/20 hover:border-secondary transition-colors"
              data-testid="preview-btn"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="hidden sm:inline">Vista Previa</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
              data-testid="save-all-btn"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Logo & Hero Images */}
          <div className="bg-surface border border-white/10 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Image className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl font-bold uppercase">Imágenes del Sitio</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-heading font-bold mb-3">Logo del Evento</label>
                <div 
                  className="relative border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="hidden"
                    data-testid="logo-upload"
                  />
                  
                  {uploading.logo ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : settings.logo_url ? (
                    <div className="relative">
                      <img 
                        src={getImageUrl(settings.logo_url)} 
                        alt="Logo" 
                        className="h-32 mx-auto object-contain"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange('logo_url', null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-white/50">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Subir Logo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image Upload */}
              <div>
                <label className="block text-sm font-heading font-bold mb-3">Imagen Hero (Fondo Principal)</label>
                <div 
                  className="relative border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => heroInputRef.current?.click()}
                >
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'hero')}
                    className="hidden"
                    data-testid="hero-upload"
                  />
                  
                  {uploading.hero ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : settings.hero_image_url ? (
                    <div className="relative">
                      <img 
                        src={getImageUrl(settings.hero_image_url)} 
                        alt="Hero" 
                        className="h-32 w-full object-cover rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange('hero_image_url', null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-white/50">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Subir Imagen Hero</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-surface border border-white/10 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-6 h-6 text-secondary" />
              <h2 className="font-heading text-2xl font-bold uppercase">Colores del Tema</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Color Primario</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.primary_color || '#FF0000'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="h-12 w-20"
                  />
                  <input
                    type="text"
                    value={settings.primary_color || '#FF0000'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-bold mb-2">Color Secundario</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.secondary_color || '#00CED1'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="h-12 w-20"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color || '#00CED1'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-bold mb-2">Color Acento</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.accent_color || '#E6007E'}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="h-12 w-20"
                  />
                  <input
                    type="text"
                    value={settings.accent_color || '#E6007E'}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-bold mb-2">Fondo</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.background_color || '#050505'}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="h-12 w-20"
                  />
                  <input
                    type="text"
                    value={settings.background_color || '#050505'}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="flex-1 bg-black/50 border border-white/20 text-white h-12 px-4 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-surface border border-white/10 p-6">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Título Principal</label>
                <input
                  type="text"
                  value={settings.hero_title || ''}
                  onChange={(e) => handleChange('hero_title', e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Subtítulo</label>
                <input
                  type="text"
                  value={settings.hero_subtitle || ''}
                  onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Descripción</label>
                <textarea
                  value={settings.hero_description || ''}
                  onChange={(e) => handleChange('hero_description', e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white px-4 py-3 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Event Dates */}
          <div className="bg-surface border border-white/10 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-warning" />
              <h2 className="font-heading text-2xl font-bold uppercase">Fechas del Evento</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Fecha de Inicio</label>
                <input
                  type="text"
                  value={settings.event_start_date || ''}
                  onChange={(e) => handleChange('event_start_date', e.target.value)}
                  placeholder="27 de Febrero 2026"
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Fecha de Fin</label>
                <input
                  type="text"
                  value={settings.event_end_date || ''}
                  onChange={(e) => handleChange('event_end_date', e.target.value)}
                  placeholder="1 de Marzo 2026"
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-heading font-bold mb-2">Ubicación</label>
                <input
                  type="text"
                  value={settings.event_location || ''}
                  onChange={(e) => handleChange('event_location', e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface border border-white/10 p-6">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6">Footer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-bold mb-2">Texto del Footer</label>
                <input
                  type="text"
                  value={settings.footer_text || ''}
                  onChange={(e) => handleChange('footer_text', e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.footer_email || ''}
                    onChange={(e) => handleChange('footer_email', e.target.value)}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={settings.footer_phone || ''}
                    onChange={(e) => handleChange('footer_phone', e.target.value)}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Dirección</label>
                  <input
                    type="text"
                    value={settings.footer_address || ''}
                    onChange={(e) => handleChange('footer_address', e.target.value)}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full bg-primary text-white font-heading font-black uppercase px-8 py-4 hover:bg-primary/80 transition-colors disabled:opacity-50"
            data-testid="save-bottom-btn"
          >
            {saving ? 'Guardando...' : 'Guardar Toda la Configuración'}
          </button>
        </div>
      </div>
      </div>
    </>
  );
};
