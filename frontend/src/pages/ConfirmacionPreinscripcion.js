import React from 'react';
import { CheckCircle, MessageCircle, AlertTriangle, Clock, Building, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConfirmacionPreinscripcion = () => {
  const whatsappCarlos = "https://wa.me/573104223288?text=Hola%20Carlos,%20acabo%20de%20realizar%20mi%20preinscripci%C3%B3n%20al%20Super%20GP%20Corona%20Club%20XP%20y%20adjunto%20mi%20comprobante%20de%20pago.";

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

          {/* Payment Methods */}
          <div className="bg-black/50 border border-secondary/30 p-6 mb-6 text-left">
            <h2 className="font-heading text-xl font-bold text-secondary mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Nuestros medios de pago:</span>
            </h2>
            
            <div className="space-y-4 text-white/90">
              {/* Bancolombia */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-yellow-400">Bancolombia</span>
                </div>
                <p className="text-sm">Cuenta de Ahorros: <span className="font-mono font-bold text-lg">86815200928</span></p>
                <p className="text-white/70 text-sm">Club Deportivo Corona Club Xtreme Park</p>
              </div>

              {/* Nequi */}
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-purple-400">Nequi</span>
                </div>
                <p className="font-mono font-bold text-lg">3104223288</p>
              </div>

              {/* Davivienda */}
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-red-400">Davivienda</span>
                </div>
                <p className="text-sm">Cuenta Corriente: <span className="font-mono font-bold text-lg">197060011255</span></p>
                <p className="text-white/70 text-sm">Carlos Alberto Alarcón</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Instructions */}
          <div className="bg-green-500/10 border border-green-500/30 p-6 mb-6">
            <p className="text-white/90 mb-4 font-bold">
              ¿Necesitas contactarnos? Escríbenos por WhatsApp:
            </p>
            <p className="text-white/80">
              <strong className="text-green-400">Carlos Alarcón:</strong> 3104223288
            </p>
            <p className="text-white/70 mt-4 text-sm">
              Tu inscripción quedará confirmada únicamente después de validar el pago.
            </p>
          </div>

          {/* WhatsApp Button */}
          <div className="flex justify-center mb-6">
            <a
              href={whatsappCarlos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-green-500 text-white font-heading font-bold uppercase px-6 py-3 hover:bg-green-600 transition-colors"
              data-testid="btn-whatsapp-carlos"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Carlos</span>
            </a>
          </div>

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
