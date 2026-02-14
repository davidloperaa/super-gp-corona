import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Save } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CONTENT_FIELDS = [
  { key: 'hero_title', label: 'Título Hero', type: 'text' },
  { key: 'hero_subtitle', label: 'Subtítulo Hero', type: 'text' },
  { key: 'hero_description', label: 'Descripción Hero', type: 'textarea' },
  { key: 'event_location', label: 'Ubicación del Evento', type: 'text' },
  { key: 'event_dates', label: 'Fechas del Evento', type: 'text' },
  { key: 'about_title', label: 'Título Sobre el Evento', type: 'text' },
  { key: 'about_content', label: 'Contenido Sobre el Evento', type: 'textarea' },
  { key: 'contact_email', label: 'Email de Contacto', type: 'email' },
  { key: 'contact_phone', label: 'Teléfono de Contacto', type: 'tel' },
  { key: 'instagram_url', label: 'URL Instagram', type: 'url' },
  { key: 'facebook_url', label: 'URL Facebook', type: 'url' },
];

export const AdminContenido = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchContent();
  }, [navigate]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setContent(response.data.contents || {});
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (key, value) => {
    setContent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (key) => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      await axios.put(
        `${API}/admin/content`,
        { key, value: content[key] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${key} actualizado exitosamente`);
    } catch (error) {
      alert('Error al actualizar contenido');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const promises = CONTENT_FIELDS.map((field) =>
        axios.put(
          `${API}/admin/content`,
          { key: field.key, value: content[field.key] || '' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(promises);
      alert('Todo el contenido actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar contenido');
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
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-heading text-5xl font-black uppercase text-glow-red" data-testid="contenido-title">
            GESTIONAR CONTENIDO
          </h1>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            data-testid="btn-guardar-todo"
            className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
          </button>
        </div>

        <div className="bg-surface border border-white/10 p-6 mb-8">
          <p className="text-white/80">
            Edita el contenido de las diferentes secciones de la página web.
          </p>
        </div>

        <div className="space-y-6">
          {CONTENT_FIELDS.map((field, index) => (
            <div
              key={field.key}
              data-testid={`content-field-${index}`}
              className="bg-surface border border-white/10 p-6"
            >
              <label className="block text-sm font-heading font-bold mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={content[field.key] || ''}
                  onChange={(e) => handleContentChange(field.key, e.target.value)}
                  rows={4}
                  className="w-full bg-black/50 border border-white/20 focus:border-secondary text-white px-4 py-3 outline-none resize-none mb-3"
                />
              ) : (
                <input
                  type={field.type}
                  value={content[field.key] || ''}
                  onChange={(e) => handleContentChange(field.key, e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-secondary text-white h-12 px-4 outline-none mb-3"
                />
              )}
              <button
                onClick={() => handleSave(field.key)}
                disabled={saving}
                className="flex items-center space-x-2 bg-primary text-white font-heading font-bold uppercase px-4 py-2 hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
