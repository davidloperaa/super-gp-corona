import React from 'react';

const imagenes = [
  {
    url: 'https://images.unsplash.com/photo-1760979191911-70a8c01ed015?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxtb3RvY3Jvc3MlMjBqdW1wJTIwZGlydCUyMHRyYWNrJTIwYWN0aW9ufGVufDB8fHx8MTc3MDY3MDQ2Mnww&ixlib=rb-4.1.0&q=85',
    titulo: 'Motocross Extremo',
  },
  {
    url: 'https://images.unsplash.com/photo-1746690818493-128cb32d23a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxtb3RvY3Jvc3MlMjBqdW1wJTIwZGlydCUyMHRyYWNrJTIwYWN0aW9ufGVufDB8fHx8MTc3MDY3MDQ2Mnww&ixlib=rb-4.1.0&q=85',
    titulo: 'Acción en la Pista',
  },
  {
    url: 'https://images.unsplash.com/photo-1752348511598-e30c96fb7cd2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHxnbyUyMGthcnQlMjByYWNpbmclMjB0cmFjayUyMGFjdGlvbnxlbnwwfHx8fDE3NzA2NzA0NjN8MA&ixlib=rb-4.1.0&q=85',
    titulo: 'Karting de Alta Velocidad',
  },
  {
    url: 'https://images.unsplash.com/photo-1752348622936-d81ed3d3152b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHxnbyUyMGthcnQlMjByYWNpbmclMjB0cmFjayUyMGFjdGlvbnxlbnwwfHx8fDE3NzA2NzA0NjN8MA&ixlib=rb-4.1.0&q=85',
    titulo: 'Competencia Karts',
  },
  {
    url: 'https://images.unsplash.com/photo-1752435200915-4f16168c6e89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxtb3RvY3Jvc3MlMjByYWNlJTIwd2lubmVyJTIwdHJvcGh5JTIwcG9kaXVtfGVufDB8fHx8MTc3MDY3MDQ3NHww&ixlib=rb-4.1.0&q=85',
    titulo: 'Celebración del Podio',
  },
  {
    url: 'https://images.unsplash.com/photo-1752778312055-3b7798f167b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxtb3RvY3Jvc3MlMjBjcm93ZCUyMGNoZWVyaW5nJTIwZmFuc3xlbnwwfHx8fDE3NzA2NzA0NjV8MA&ixlib=rb-4.1.0&q=85',
    titulo: 'Aficionados en las Gradas',
  },
];

export const Galeria = () => {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black uppercase tracking-tighter text-glow-red mb-4" data-testid="galeria-title">
            GALERÍA
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Revive la emoción de ediciones anteriores y prepárate para la próxima competencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imagenes.map((imagen, index) => (
            <div
              key={index}
              data-testid={`galeria-imagen-${index}`}
              className="group relative overflow-hidden border border-white/20 hover:border-primary transition-all duration-300 aspect-video"
            >
              <img
                src={imagen.url}
                alt={imagen.titulo}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-heading text-xl font-bold uppercase">{imagen.titulo}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/70 text-lg mb-8">
            ¿Tienes fotos del evento que quieres compartir? Envíanoslas a nuestras redes sociales con el hashtag
          </p>
          <div className="inline-block bg-surface border border-secondary px-8 py-4">
            <span className="font-heading text-2xl font-black text-secondary">#SuperGPCoronaXP2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
