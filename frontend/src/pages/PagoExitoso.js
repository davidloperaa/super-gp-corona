import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration_id');
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (registrationId) {
      verifyAndFetchRegistration();
    }
  }, [registrationId]);

  const verifyAndFetchRegistration = async () => {
    try {
      // First, verify the payment with MercadoPago
      setVerifying(true);
      const verifyResponse = await axios.post(`${API}/payments/verify/${registrationId}`);
      setPaymentVerified(verifyResponse.data.status === 'completed');
      
      // Then fetch the updated registration
      const response = await axios.get(`${API}/registrations/${registrationId}`);
      setRegistration(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleRetryVerification = async () => {
    setVerifying(true);
    try {
      const verifyResponse = await axios.post(`${API}/payments/verify/${registrationId}`);
      setPaymentVerified(verifyResponse.data.status === 'completed');
      
      const response = await axios.get(`${API}/registrations/${registrationId}`);
      setRegistration(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setVerifying(false);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <CheckCircle className={`w-24 h-24 mx-auto mb-6 ${registration?.estado_pago === 'completado' ? 'text-secondary' : 'text-warning'}`} />
          <h1 className="font-heading text-5xl font-black uppercase text-glow-cyan mb-4" data-testid="pago-exitoso-title">
            {registration?.estado_pago === 'completado' ? '¡PAGO CONFIRMADO!' : '¡PAGO EN PROCESO!'}
          </h1>
          <p className="text-white/80 text-lg">
            {registration?.estado_pago === 'completado' 
              ? 'Tu inscripción ha sido confirmada. Recibirás un correo de confirmación.'
              : 'Tu pago está siendo procesado. Por favor espera unos momentos.'}
          </p>
          
          {registration?.estado_pago !== 'completado' && (
            <button
              onClick={handleRetryVerification}
              disabled={verifying}
              className="mt-4 flex items-center space-x-2 bg-warning text-black font-heading font-bold uppercase px-6 py-3 mx-auto hover:bg-warning/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Verificando...' : 'Verificar Pago'}</span>
            </button>
          )}
        </div>

        {registration && (
          <div className="bg-surface border border-secondary/50 p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6 text-secondary">Detalles de tu Inscripción</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm">ID de Inscripción</p>
                  <p className="font-heading font-bold">{registration.id}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Número de Competición</p>
                  <p className="font-heading font-bold text-primary">#{registration.numero_competicion}</p>
                </div>
              </div>

              <div>
                <p className="text-white/70 text-sm">Piloto</p>
                <p className="font-heading font-bold text-lg">{registration.nombre} {registration.apellido}</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-2">Categorías Inscritas</p>
                <div className="flex flex-wrap gap-2">
                  {registration.categorias.map((cat, idx) => (
                    <span key={idx} className="bg-primary/20 border border-primary px-3 py-1 text-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-heading font-black">TOTAL PAGADO:</span>
                  <span className="font-heading font-black text-secondary">
                    COP {registration.precio_final?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-black/50 border border-white/10 p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-heading font-bold mb-2">Confirmación por Email</h3>
              <p className="text-white/70 text-sm">
                Hemos enviado un correo de confirmación a <span className="text-white font-bold">{registration?.correo}</span> con todos los detalles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <Link to="/" className="bg-surface text-white font-heading font-bold uppercase px-8 py-4 border border-white/20 hover:border-white transition-colors">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
