import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, ArrowLeft, Save, CreditCard, Eye, EyeOff,
  AlertCircle, CheckCircle, Building2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const SuperAdminMercadoPago = () => {
  const navigate = useNavigate();
  const [eventConfig, setEventConfig] = useState({
    mercadopago_access_token: '',
    mercadopago_public_key: '',
    business_name: ''
  });
  const [showTokens, setShowTokens] = useState(false);
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
      const response = await axios.get(`${API}/superadmin/event-mercadopago`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.config;
      setEventConfig({
        mercadopago_access_token: '',
        mercadopago_public_key: data.mercadopago_public_key || '',
        business_name: data.business_name || '',
        access_token_masked: data.mercadopago_access_token_masked || ''
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

  const handleSaveEvent = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('super_admin_token');
      const updateData = {
        business_name: eventConfig.business_name
      };
      
      // Only include credentials if they were changed
      if (eventConfig.mercadopago_access_token) {
        updateData.mercadopago_access_token = eventConfig.mercadopago_access_token;
      }
      if (eventConfig.mercadopago_public_key) {
        updateData.mercadopago_public_key = eventConfig.mercadopago_public_key;
      }

      await axios.put(`${API}/superadmin/event-mercadopago`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: '¡Configuración de MercadoPago actualizada!' });
      
      // Clear sensitive fields and refetch
      setEventConfig(prev => ({ ...prev, mercadopago_access_token: '' }));
      fetchConfig();
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
            <CreditCard className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white">Configuración MercadoPago</span>
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

        {/* Event MercadoPago Config */}
        <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Cuenta del Evento (Cliente)</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Configura las credenciales de MercadoPago del organizador del evento. 
            Los pagos de inscripciones (menos la comisión) irán a esta cuenta.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={eventConfig.business_name}
                onChange={(e) => setEventConfig({ ...eventConfig, business_name: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Ej: Corona Club XP"
                data-testid="business-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Token
                {eventConfig.access_token_masked && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Actual: {eventConfig.access_token_masked})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={eventConfig.mercadopago_access_token}
                  onChange={(e) => setEventConfig({ ...eventConfig, mercadopago_access_token: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 pr-12 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Dejar vacío para mantener el actual"
                  data-testid="access-token"
                />
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showTokens ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Public Key
              </label>
              <input
                type="text"
                value={eventConfig.mercadopago_public_key}
                onChange={(e) => setEventConfig({ ...eventConfig, mercadopago_public_key: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="APP_USR-xxxx..."
                data-testid="public-key"
              />
            </div>
          </div>

          <button
            onClick={handleSaveEvent}
            disabled={saving}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            data-testid="save-mercadopago-btn"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>

        {/* Help Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h4 className="text-blue-300 font-bold mb-3">¿Dónde obtener las credenciales?</h4>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>Ingresa a <a href="https://www.mercadopago.com.co/developers/panel/app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">MercadoPago Developers</a></li>
            <li>Crea una aplicación o selecciona una existente</li>
            <li>Ve a "Credenciales" → "Credenciales de producción"</li>
            <li>Copia el Access Token y Public Key</li>
          </ol>
        </div>

        {/* Warning */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-bold">Seguridad</h4>
              <p className="text-gray-300 text-sm mt-1">
                Los Access Tokens son sensibles. Nunca los compartas públicamente. 
                Asegúrate de usar credenciales de producción para pagos reales.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
