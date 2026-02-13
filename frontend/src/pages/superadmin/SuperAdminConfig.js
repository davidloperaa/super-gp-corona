import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, ArrowLeft, Save, Percent, DollarSign, 
  AlertCircle, CheckCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const SuperAdminConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    commission_type: 'percentage',
    commission_value: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('super_admin_token');
    if (!token) {
      navigate('/superadmin/login');
      return;
    }
    fetchConfig();
  }, [navigate]);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('super_admin_token');
      const response = await axios.get(`${API}/superadmin/platform-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.config;
      setConfig({
        commission_type: data.commission_type || 'percentage',
        commission_value: data.commission_value || 5
      });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('super_admin_token');
        navigate('/superadmin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('super_admin_token');
      await axios.put(`${API}/superadmin/platform-config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: '¡Configuración guardada exitosamente!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-white">Configuración de Comisiones</span>
          </div>
          <Link 
            to="/superadmin/dashboard"
            className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Tipo de Comisión</h2>

          {/* Commission Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setConfig({ ...config, commission_type: 'percentage' })}
              className={`p-6 rounded-xl border-2 transition-all ${
                config.commission_type === 'percentage'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              data-testid="commission-type-percentage"
            >
              <Percent className={`w-10 h-10 mb-4 ${
                config.commission_type === 'percentage' ? 'text-purple-400' : 'text-gray-500'
              }`} />
              <h3 className="text-lg font-bold text-white mb-2">Porcentaje</h3>
              <p className="text-gray-400 text-sm">
                Cobra un porcentaje del valor total de cada inscripción
              </p>
            </button>

            <button
              onClick={() => setConfig({ ...config, commission_type: 'fixed' })}
              className={`p-6 rounded-xl border-2 transition-all ${
                config.commission_type === 'fixed'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              data-testid="commission-type-fixed"
            >
              <DollarSign className={`w-10 h-10 mb-4 ${
                config.commission_type === 'fixed' ? 'text-purple-400' : 'text-gray-500'
              }`} />
              <h3 className="text-lg font-bold text-white mb-2">Monto Fijo</h3>
              <p className="text-gray-400 text-sm">
                Cobra un valor fijo en pesos por cada inscripción
              </p>
            </button>
          </div>

          {/* Commission Value */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {config.commission_type === 'percentage' 
                ? 'Porcentaje de Comisión (%)' 
                : 'Monto de Comisión (COP)'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.commission_value}
                onChange={(e) => setConfig({ ...config, commission_value: parseFloat(e.target.value) || 0 })}
                min="0"
                max={config.commission_type === 'percentage' ? 100 : undefined}
                step={config.commission_type === 'percentage' ? 0.5 : 1000}
                className="w-full bg-gray-800/50 border border-gray-700 text-white text-2xl font-bold px-6 py-4 rounded-xl focus:border-purple-500 focus:outline-none"
                data-testid="commission-value"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                {config.commission_type === 'percentage' ? '%' : 'COP'}
              </span>
            </div>
            
            {/* Example calculation */}
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm">
                <strong className="text-purple-400">Ejemplo:</strong> Para una inscripción de $120,000 COP
              </p>
              <p className="text-white text-lg mt-2">
                Comisión: <strong className="text-purple-400">
                  {config.commission_type === 'percentage'
                    ? `$${(120000 * config.commission_value / 100).toLocaleString('es-CO')} COP`
                    : `$${config.commission_value.toLocaleString('es-CO')} COP`
                  }
                </strong>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Neto al evento: $
                {config.commission_type === 'percentage'
                  ? (120000 - (120000 * config.commission_value / 100)).toLocaleString('es-CO')
                  : (120000 - config.commission_value).toLocaleString('es-CO')
                } COP
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            data-testid="save-config-btn"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>

        {/* Warning Box */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-bold">Importante</h4>
              <p className="text-gray-300 text-sm mt-1">
                Los cambios en la configuración de comisiones solo afectarán a las nuevas inscripciones. 
                Las inscripciones existentes mantendrán la comisión calculada al momento de su creación.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
