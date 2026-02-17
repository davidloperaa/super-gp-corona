import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/categorias', label: 'Categorías' },
    { to: '/calendario', label: 'Calendario' },
    { to: '/inscripcion', label: 'Inscripciones' },
    { to: '/galeria', label: 'Galería' },
    { to: '/noticias', label: 'Noticias' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3" data-testid="nav-logo">
            <Trophy className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-heading text-sm font-black uppercase text-glow-red leading-tight">CAMPEONATO INTERLIGAS</span>
              <span className="font-heading text-xs text-secondary leading-tight">SUPER GP CORONA CLUB XP</span>
            </div>
          </Link>

          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`px-4 py-2 font-heading uppercase text-sm font-bold transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-white hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            to="/inscripcion"
            data-testid="cta-inscribirse"
            className="hidden md:block bg-primary text-white font-heading font-black uppercase px-6 py-3 skew-racing hover:skew-x-0 transition-transform border-2 border-transparent hover:border-white"
          >
            <span className="unskew block">Inscríbete</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-surface border-t border-white/10" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block py-2 font-heading uppercase font-bold ${
                  location.pathname === link.to ? 'text-primary' : 'text-white hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/inscripcion"
              onClick={() => setIsOpen(false)}
              className="block bg-primary text-white font-heading font-black uppercase px-6 py-3 text-center"
            >
              Inscríbete Ahora
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
