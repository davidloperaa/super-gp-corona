import React from 'react';
import { Calendar, Clock, MapPin, Flag } from 'lucide-react';

const eventos = [
  {
    dia: 'Jueves 20',
    fecha: '20 de Febrero 2026',
    actividades: [
      { hora: '08:00 - 12:00', titulo: 'Aguapanelazo', descripcion: 'Recepción y acreditación de pilotos' },
      { hora: '13:00 - 18:00', titulo: 'Entrenamientos', descripcion: 'Sesión de entrenamientos libres todas las categorías' },
    ],
  },
  {
    dia: 'Viernes 21',
    fecha: '21 de Febrero 2026',
    actividades: [
      { hora: '08:00 - 12:00', titulo: 'Entrenamientos Reconocimientos 2025', descripcion: 'Sesión clasificatoria para todas las categorías' },
      { hora: '13:00 - 18:00', titulo: 'Carreras Clasificatorias', descripcion: 'Primera ronda de carreras clasificatorias' },
    ],
  },
  {
    dia: 'Sábado 22',
    fecha: '22 de Febrero 2026',
    actividades: [
      { hora: '08:00 - 14:00', titulo: 'CARRERAS FINALES', descripcion: 'Carreras finales - Todas las categorías' },
      { hora: '15:00 - 17:00', titulo: 'Premiación', descripcion: 'Ceremonia de premiación y entrega de trofeos' },
    ],
  },
];

const disciplinas = [
  { nombre: 'MOTOVELOCIDAD', ubicacion: 'Pista Principal' },
  { nombre: 'SUPERMOTO', ubicacion: 'Circuito Mixto' },
  { nombre: 'VELOTIERRA', ubicacion: 'Pista de Tierra' },
  { nombre: 'MOTOCROSS', ubicacion: 'Track Motocross' },
  { nombre: 'VELOARENA', ubicacion: 'Arena Indoor' },
  { nombre: 'KARTS', ubicacion: 'Kartodromo' },
];

export const Calendario = () => {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black uppercase tracking-tighter text-glow-red mb-4" data-testid="calendario-title">
            CALENDARIO
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Tres días intensos de competencia, adrenalina y emoción. Planifica tu participación.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {eventos.map((evento, index) => (
            <div
              key={index}
              data-testid={`dia-evento-${index}`}
              className="bg-surface border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              <div className="bg-primary p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-6 h-6" />
                  <h2 className="font-heading text-3xl font-black uppercase">{evento.dia}</h2>
                </div>
                <p className="text-white/90 font-heading">{evento.fecha}</p>
              </div>

              <div className="p-6 space-y-4">
                {evento.actividades.map((actividad, idx) => (
                  <div key={idx} className="border-l-2 border-secondary pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span className="font-heading font-bold text-sm">{actividad.hora}</span>
                    </div>
                    <h3 className="font-heading font-bold uppercase text-lg mb-1">{actividad.titulo}</h3>
                    <p className="text-white/70 text-sm">{actividad.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="font-heading text-4xl font-bold uppercase mb-8 text-center">
            <span className="text-glow-cyan">DISCIPLINAS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disciplinas.map((disciplina, index) => (
              <div
                key={index}
                data-testid={`disciplina-${index}`}
                className="bg-black/50 border border-white/20 p-6 hover:border-secondary transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Flag className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-heading text-xl font-black uppercase mb-2 group-hover:text-secondary transition-colors">
                  {disciplina.nombre}
                </h3>
                <div className="flex items-center space-x-2 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{disciplina.ubicacion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-accent p-8 border-l-4 border-warning">
          <h2 className="font-heading text-2xl font-bold uppercase mb-4">Información del Evento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div>
              <h3 className="font-heading font-bold mb-2 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Ubicación</span>
              </h3>
              <p>Corona Club XP</p>
              <p>Avenida Panamericana, KM 9 El Cofre</p>
              <p>Popayán, Cauca - Colombia</p>
            </div>
            <div>
              <h3 className="font-heading font-bold mb-2 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Horarios</span>
              </h3>
              <p>Puertas abren: 7:00 AM</p>
              <p>Inicio de actividades: 8:00 AM</p>
              <p>Cierre diario: 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
