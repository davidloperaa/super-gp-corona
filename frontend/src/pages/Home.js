import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Flag, Timer, MapPin, Flame } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen">
      <section
        className="relative h-screen flex items-end pb-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1760979191911-70a8c01ed015?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxtb3RvY3Jvc3MlMjBqdW1wJTIwZGlydCUyMHRyYWNrJTIwYWN0aW9ufGVufDB8fHx8MTc3MDY3MDQ2Mnww&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="space-y-6">
            <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter text-glow-red" data-testid="hero-title">
              CAMPEONATO<br />
              INTERLIGAS<br />
              <span className="text-secondary text-glow-cyan">SUPER GP</span>
            </h1>
            
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-warning" />
                <span className="font-heading text-xl font-bold">20 - 21 - 22 FEBRERO 2026</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-warning" />
                <span className="font-heading text-xl font-bold">POPAYÁN, COLOMBIA</span>
              </div>
            </div>

            <p className="text-white/80 text-lg max-w-2xl">
              Vive la emoción del motociclismo extremo. 32 categorías, 3 días de competencia, adrenalina sin límites.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/inscripcion"
                data-testid="hero-cta-inscripcion"
                className="inline-block bg-primary text-white font-heading font-black uppercase px-8 py-4 skew-racing hover:skew-x-0 transition-transform border-2 border-transparent hover:border-white"
              >
                <span className="unskew block">Inscríbete Ahora</span>
              </Link>
              <Link
                to="/categorias"
                data-testid="hero-cta-categorias"
                className="inline-block bg-surface text-white font-heading font-black uppercase px-8 py-4 border-2 border-secondary hover:bg-secondary hover:text-black transition-colors"
              >
                Ver Categorías
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-center mb-16" data-testid="features-title">
            <span className="text-glow-red">POR QUÉ PARTICIPAR</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/50 border border-white/10 p-8 hover:border-primary/50 transition-colors group" data-testid="feature-card-1">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Trophy className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-heading text-2xl font-bold uppercase mb-3">32 Categorías</h3>
              <p className="text-white/70">
                Desde infantil hasta alto cilindraje. Encuentra tu categoría y compite con los mejores.
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 p-8 hover:border-primary/50 transition-colors group" data-testid="feature-card-2">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Flame className="w-12 h-12 text-secondary mb-4" />
              <h3 className="font-heading text-2xl font-bold uppercase mb-3">Competencia de Élite</h3>
              <p className="text-white/70">
                Los mejores pilotos de Colombia reunidos en un solo lugar. Adrenalina pura.
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 p-8 hover:border-primary/50 transition-colors group" data-testid="feature-card-3">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Flag className="w-12 h-12 text-warning mb-4" />
              <h3 className="font-heading text-2xl font-bold uppercase mb-3">Premios Increibles</h3>
              <p className="text-white/70">
                Trofeos, reconocimientos y premios en efectivo para los ganadores de cada categoría.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">
                <span className="text-glow-red">SOBRE EL EVENTO</span>
              </h2>
              <p className="text-white/80 text-lg mb-6">
                El Campeonato Interligas Super GP Corona XP 2026 es el evento de motociclismo más importante de la región del Cauca. Durante tres días consecutivos, reuniremos a los mejores pilotos en múltiples disciplinas.
              </p>
              <p className="text-white/80 text-lg mb-6">
                Desde las categorías infantiles hasta el alto cilindraje, pasando por motocross, veloarena, karts y más. Este es el escenario perfecto para demostrar tu habilidad y pasión por el motor.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="text-white">3 días de competencia intensa</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-white">32 categorías diferentes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Flag className="w-5 h-5 text-primary" />
                  <span className="text-white">Pilotos de toda Colombia</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1746690818493-128cb32d23a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxtb3RvY3Jvc3MlMjBqdW1wJTIwZGlydCUyMHRyYWNrJTIwYWN0aW9ufGVufDB8fHx8MTc3MDY3MDQ2Mnww&ixlib=rb-4.1.0&q=85"
                alt="Motocross"
                className="w-full h-48 object-cover border border-white/20"
              />
              <img
                src="https://images.unsplash.com/photo-1752348511598-e30c96fb7cd2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHxnbyUyMGthcnQlMjByYWNpbmclMjB0cmFjayUyMGFjdGlvbnxlbnwwfHx8fDE3NzA2NzA0NjN8MA&ixlib=rb-4.1.0&q=85"
                alt="Karting"
                className="w-full h-48 object-cover border border-white/20"
              />
              <img
                src="https://images.unsplash.com/photo-1752435200915-4f16168c6e89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxtb3RvY3Jvc3MlMjByYWNlJTIwd2lubmVyJTIwdHJvcGh5JTIwcG9kaXVtfGVufDB8fHx8MTc3MDY3MDQ3NHww&ixlib=rb-4.1.0&q=85"
                alt="Podium"
                className="w-full h-48 object-cover border border-white/20"
              />
              <img
                src="https://images.unsplash.com/photo-1752778312055-3b7798f167b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxtb3RvY3Jvc3MlMjBjcm93ZCUyMGNoZWVyaW5nJTIwZmFuc3xlbnwwfHx8fDE3NzA2NzA0NjV8MA&ixlib=rb-4.1.0&q=85"
                alt="Crowd"
                className="w-full h-48 object-cover border border-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">
            ¿LISTO PARA LA CARRERA?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Inscríbete ahora y asegura tu lugar en el campeonato más emocionante del año.
          </p>
          <Link
            to="/inscripcion"
            data-testid="cta-final-inscripcion"
            className="inline-block bg-black text-white font-heading font-black uppercase px-12 py-5 skew-racing hover:skew-x-0 transition-transform border-2 border-white hover:bg-white hover:text-black"
          >
            <span className="unskew block">Inscríbete Ya</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
