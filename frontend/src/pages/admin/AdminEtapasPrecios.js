import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Trash2, Save, Eye, ArrowLeft } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLOR_OPTIONS = [
  { value: 'green', label: 'Verde', preview: 'bg-green-500' },
  { value: 'yellow', label: 'Amarillo', preview: 'bg-yellow-500' },
  { value: 'orange', label: 'Naranja', preview: 'bg-orange-500' },
  { value: 'red-orange', label: 'Naranja Oscuro', preview: 'bg-orange-600' },
  { value: 'red', label: 'Rojo', preview: 'bg-red-500' }
];

export const AdminEtapasPrecios = () => {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [notaDevolucion, setNotaDevolucion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStages();
  }, [navigate]);

  const fetchStages = async () => {
    try {
      const response = await axios.get(`${API}/pricing-stages`);
      setStages(response.data.stages || []);
      setNotaDevolucion(response.data.nota_devolucion || '');
    } catch (error) {
      console.error('Error fetching stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = (index, field, value) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: field === 'precio' ? Number(value) : value };
    setStages(newStages);
  };

  const addStage = () => {
    setStages([
      ...stages,
      { etapa: `Etapa ${stages.length + 1}`, precio: 100000, fecha: '', color: 'green' }
    ]);
  };

  const removeStage = (index) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('admin_token');
    setSaving(true);
    try {
      await axios.put(
        `${API}/admin/pricing-stages`,
        { stages, nota_devolucion: notaDevolucion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Etapas de precios guardadas exitosamente');
    } catch (error) {
      console.error('Error saving stages:', error);
      alert('Error al guardar las etapas');
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
      <AdminNavbar />
      <div className="min-h-screen pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-surface border border-white/20 hover:border-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-heading text-3xl font-black uppercase text-glow-red">
                  Etapas de Precios
                </h1>
                <p className="text-white/70">Configura las etapas de precios de inscripción</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <a
                href="/categorias"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-secondary/20 text-secondary px-4 py-2 hover:bg-secondary/30 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Vista Previa</span>
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-primary text-white font-heading font-bold uppercase px-6 py-2 hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>

          {/* Stages List */}
          <div className="space-y-4 mb-8">
            {stages.map((stage, index) => (
              <div 
                key={index} 
                className="bg-surface border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading text-lg font-bold text-secondary">
                    Etapa {index + 1}
                  </h3>
                  {stages.length > 1 && (
                    <button
                      onClick={() => removeStage(index)}
                      className="p-2 text-red-500 hover:bg-red-500/20 transition-colors"
                      title="Eliminar etapa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Nombre de la Etapa</label>
                    <input
                      type="text"
                      value={stage.etapa}
                      onChange={(e) => handleStageChange(index, 'etapa', e.target.value)}
                      className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white focus:border-secondary focus:outline-none"
                      placeholder="Ej: Etapa 1"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Precio (COP)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="number"
                        value={stage.precio}
                        onChange={(e) => handleStageChange(index, 'precio', e.target.value)}
                        className="w-full bg-black/50 border border-white/20 px-4 py-3 pl-10 text-white focus:border-secondary focus:outline-none"
                        placeholder="100000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Fecha/Descripción</label>
                    <input
                      type="text"
                      value={stage.fecha}
                      onChange={(e) => handleStageChange(index, 'fecha', e.target.value)}
                      className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white focus:border-secondary focus:outline-none"
                      placeholder="Ej: Hasta el Miércoles 1 de Abril"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Color</label>
                    <div className="flex space-x-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleStageChange(index, 'color', color.value)}
                          className={`w-10 h-10 ${color.preview} ${
                            stage.color === color.value 
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-black' 
                              : 'opacity-50 hover:opacity-100'
                          } transition-all`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Stage Button */}
          <button
            onClick={addStage}
            className="w-full border-2 border-dashed border-white/20 p-4 text-white/50 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center space-x-2 mb-8"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Etapa</span>
          </button>

          {/* Note for Returns */}
          <div className="bg-surface border border-white/10 p-6">
            <label className="block text-white/70 text-sm mb-2">Nota de Devoluciones</label>
            <input
              type="text"
              value={notaDevolucion}
              onChange={(e) => setNotaDevolucion(e.target.value)}
              className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white focus:border-secondary focus:outline-none"
              placeholder="Ej: Devoluciones con excusa hasta el Viernes 11 de Abril"
            />
            <p className="text-white/40 text-xs mt-2">
              Este texto aparecerá debajo de las etapas de precios
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
