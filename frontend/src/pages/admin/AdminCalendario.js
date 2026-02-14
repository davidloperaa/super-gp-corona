import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, Plus, Trash2, Save, Clock, MapPin, Flag,
  CheckCircle, AlertCircle, GripVertical
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminCalendario = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('eventos');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCalendar();
  }, [navigate]);

  const fetchCalendar = async () => {
    try {
      const response = await axios.get(`${API}/calendar`);
      setEventos(response.data.eventos || []);
      setDisciplinas(response.data.disciplinas || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar el calendario' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('admin_token');

    try {
      await axios.put(
        `${API}/admin/calendar`,
        { eventos, disciplinas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: '¡Calendario guardado exitosamente!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar el calendario' });
    } finally {
      setSaving(false);
    }
  };

  // Eventos handlers
  const addEvento = () => {
    const newEvento = {
      id: `dia-${Date.now()}`,
      dia: 'Nuevo Día',
      fecha: '',
      actividades: []
    };
    setEventos([...eventos, newEvento]);
  };

  const updateEvento = (index, field, value) => {
    const updated = [...eventos];
    updated[index][field] = value;
    setEventos(updated);
  };

  const deleteEvento = (index) => {
    if (window.confirm('¿Eliminar este día del calendario?')) {
      setEventos(eventos.filter((_, i) => i !== index));
    }
  };

  const addActividad = (eventoIndex) => {
    const updated = [...eventos];
    updated[eventoIndex].actividades.push({
      hora: '',
      titulo: '',
      descripcion: ''
    });
    setEventos(updated);
  };

  const updateActividad = (eventoIndex, actIndex, field, value) => {
    const updated = [...eventos];
    updated[eventoIndex].actividades[actIndex][field] = value;
    setEventos(updated);
  };

  const deleteActividad = (eventoIndex, actIndex) => {
    const updated = [...eventos];
    updated[eventoIndex].actividades.splice(actIndex, 1);
    setEventos(updated);
  };

  // Disciplinas handlers
  const addDisciplina = () => {
    const newDisciplina = {
      id: `disc-${Date.now()}`,
      nombre: '',
      ubicacion: ''
    };
    setDisciplinas([...disciplinas, newDisciplina]);
  };

  const updateDisciplina = (index, field, value) => {
    const updated = [...disciplinas];
    updated[index][field] = value;
    setDisciplinas(updated);
  };

  const deleteDisciplina = (index) => {
    if (window.confirm('¿Eliminar esta disciplina?')) {
      setDisciplinas(disciplinas.filter((_, i) => i !== index));
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
      <AdminNavbar title="Gestión de Calendario" />
      <div className="min-h-screen pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-heading text-4xl font-black uppercase text-glow-red">
              GESTIÓN DE CALENDARIO
            </h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
              data-testid="btn-guardar-calendario"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
            </button>
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

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('eventos')}
              className={`flex items-center space-x-2 px-6 py-3 font-heading font-bold uppercase transition-colors ${
                activeTab === 'eventos' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface border border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Días del Evento</span>
            </button>
            <button
              onClick={() => setActiveTab('disciplinas')}
              className={`flex items-center space-x-2 px-6 py-3 font-heading font-bold uppercase transition-colors ${
                activeTab === 'disciplinas' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface border border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <Flag className="w-5 h-5" />
              <span>Disciplinas</span>
            </button>
          </div>

          {/* Eventos Tab */}
          {activeTab === 'eventos' && (
            <div className="space-y-6">
              {eventos.map((evento, eventoIndex) => (
                <div key={evento.id || eventoIndex} className="bg-surface border border-white/10 overflow-hidden">
                  <div className="bg-primary/20 p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4 flex-1">
                      <GripVertical className="w-5 h-5 text-white/50" />
                      <input
                        type="text"
                        value={evento.dia}
                        onChange={(e) => updateEvento(eventoIndex, 'dia', e.target.value)}
                        placeholder="Ej: Jueves 27"
                        className="bg-black/50 border border-white/20 text-white px-3 py-2 w-40"
                      />
                      <input
                        type="text"
                        value={evento.fecha}
                        onChange={(e) => updateEvento(eventoIndex, 'fecha', e.target.value)}
                        placeholder="Ej: 27 de Febrero 2026"
                        className="bg-black/50 border border-white/20 text-white px-3 py-2 flex-1"
                      />
                    </div>
                    <button
                      onClick={() => deleteEvento(eventoIndex)}
                      className="text-red-500 hover:text-red-400 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <h4 className="font-heading font-bold text-sm uppercase text-white/70">Actividades</h4>
                    
                    {evento.actividades.map((actividad, actIndex) => (
                      <div key={actIndex} className="bg-black/30 p-4 border-l-2 border-secondary">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Hora</label>
                            <input
                              type="text"
                              value={actividad.hora}
                              onChange={(e) => updateActividad(eventoIndex, actIndex, 'hora', e.target.value)}
                              placeholder="09:00 - 12:00"
                              className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Título</label>
                            <input
                              type="text"
                              value={actividad.titulo}
                              onChange={(e) => updateActividad(eventoIndex, actIndex, 'titulo', e.target.value)}
                              placeholder="Nombre de la actividad"
                              className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="md:col-span-2 flex space-x-2">
                            <div className="flex-1">
                              <label className="block text-xs text-white/50 mb-1">Descripción</label>
                              <input
                                type="text"
                                value={actividad.descripcion}
                                onChange={(e) => updateActividad(eventoIndex, actIndex, 'descripcion', e.target.value)}
                                placeholder="Descripción breve"
                                className="w-full bg-black/50 border border-white/20 text-white px-3 py-2 text-sm"
                              />
                            </div>
                            <button
                              onClick={() => deleteActividad(eventoIndex, actIndex)}
                              className="self-end text-red-500 hover:text-red-400 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addActividad(eventoIndex)}
                      className="flex items-center space-x-2 text-secondary hover:text-secondary/80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-heading uppercase">Agregar Actividad</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addEvento}
                className="w-full flex items-center justify-center space-x-2 bg-surface border-2 border-dashed border-white/20 hover:border-primary p-6 transition-colors"
              >
                <Plus className="w-6 h-6 text-primary" />
                <span className="font-heading font-bold uppercase text-white/70">Agregar Día al Calendario</span>
              </button>
            </div>
          )}

          {/* Disciplinas Tab */}
          {activeTab === 'disciplinas' && (
            <div className="space-y-4">
              {disciplinas.map((disciplina, index) => (
                <div key={disciplina.id || index} className="bg-surface border border-white/10 p-4 flex items-center space-x-4">
                  <Flag className="w-6 h-6 text-secondary" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Nombre de la Disciplina</label>
                      <input
                        type="text"
                        value={disciplina.nombre}
                        onChange={(e) => updateDisciplina(index, 'nombre', e.target.value)}
                        placeholder="Ej: MOTOVELOCIDAD"
                        className="w-full bg-black/50 border border-white/20 text-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Ubicación</label>
                      <input
                        type="text"
                        value={disciplina.ubicacion}
                        onChange={(e) => updateDisciplina(index, 'ubicacion', e.target.value)}
                        placeholder="Ej: Pista Principal"
                        className="w-full bg-black/50 border border-white/20 text-white px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDisciplina(index)}
                    className="text-red-500 hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button
                onClick={addDisciplina}
                className="w-full flex items-center justify-center space-x-2 bg-surface border-2 border-dashed border-white/20 hover:border-primary p-6 transition-colors"
              >
                <Plus className="w-6 h-6 text-primary" />
                <span className="font-heading font-bold uppercase text-white/70">Agregar Disciplina</span>
              </button>
            </div>
          )}

          {/* Save Button Bottom */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-white font-heading font-black uppercase px-8 py-4 hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Calendario'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
