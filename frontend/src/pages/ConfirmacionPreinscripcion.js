import React from 'react';
import { CheckCircle, MessageCircle, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConfirmacionPreinscripcion = () => {
  const whatsappLink = "https://wa.me/573104223288?text=Hola,%20acabo%20de%20realizar%20mi%20preinscripci%C3%B3n%20al%20Super%20GP%20Corona%20Club%20XP%20y%20adjunto%20mi%20comprobante%20de%20pago.";

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-white/10 p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-black uppercase text-glow-cyan mb-4">
            Preinscripción realizada con éxito
          </h1>

          {/* Main Message */}
          <p className="text-white/80 text-lg mb-8">
            Tu preinscripción fue recibida correctamente.
          </p>

          {/* Payment Instructions */}
          <div className="bg-black/50 border border-secondary/30 p-6 mb-6 text-left">
            <h2 className="font-heading text-xl font-bold text-secondary mb-4">
              Para confirmar tu cupo debes realizar el pago mediante transferencia a:
            </h2>
            
            <div className="space-y-3 text-white/90">
              <p className="flex items-center space-x-2">
                <span className="font-bold text-secondary">Nequi:</span>
                <span className="text-xl font-mono">3104223288</span>
              </p>
              <p>
                <span className="font-bold text-secondary">Titular:</span> Carlos Alberto Alarcón Flórez
              </p>
              <p className="text-white/70 text-sm">
                Representante Legal
              </p>
            </div>
          </div>

          {/* WhatsApp Instructions */}
          <div className="bg-green-500/10 border border-green-500/30 p-6 mb-6">
            <p className="text-white/90 mb-4">
              Después de realizar el pago, envía el comprobante al WhatsApp: <strong className="text-green-400">3104223288</strong>
            </p>
            <p className="text-white/70">
              Tu inscripción quedará confirmada únicamente después de validar el pago.
            </p>
          </div>

          {/* WhatsApp Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-green-500 text-white font-heading font-bold uppercase px-8 py-4 hover:bg-green-600 transition-colors text-lg mb-6"
            data-testid="btn-whatsapp"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Enviar comprobante por WhatsApp</span>
          </a>

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/30 p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-bold">
                El cupo no queda confirmado hasta validar el pago.
              </p>
            </div>
          </div>

          {/* Time Limit */}
          <div className="bg-primary/10 border border-primary/30 p-4 mb-8">
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Clock className="w-5 h-5" />
              <p>
                El cupo quedará reservado por <strong>24 horas</strong> mientras realizas el pago.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <Link
            to="/"
            className="text-secondary hover:text-secondary/80 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
