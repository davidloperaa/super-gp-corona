import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';

export const PagoFallido = () => {
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <XCircle className="w-24 h-24 text-primary mx-auto mb-6" />
          <h1 className="font-heading text-5xl font-black uppercase text-glow-red mb-4">
            PAGO NO COMPLETADO
          </h1>
          <p className="text-white/80 text-lg">
            Hubo un problema al procesar tu pago. Puedes intentarlo nuevamente.
          </p>
        </div>

        <div className="bg-surface border border-primary/50 p-8 mb-8">
          <h2 className="font-heading text-xl font-bold uppercase mb-4">¿Qué ocurrió?</h2>
          <p className="text-white/80">Tu inscripción sigue registrada con el ID: <span className="font-heading font-bold text-secondary">{registrationId}</span></p>
        </div>

        <div className="flex justify-center space-x-4">
          <Link to="/inscripcion" className="flex items-center space-x-2 bg-primary text-white font-heading font-bold uppercase px-8 py-4 hover:bg-primary/80">
            <RefreshCw className="w-5 h-5" />
            <span>Intentar de Nuevo</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
