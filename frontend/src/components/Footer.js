import React from 'react';
import { Trophy, Instagram, Facebook, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-heading text-lg font-black text-glow-red">SUPER GP</h3>
                <p className="text-secondary text-sm">Corona XP 2026</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              Campeonato Interligas de Motociclismo - Popayán, Colombia
            </p>
          </div>

          <div>
            <h4 className="font-heading text-white font-bold mb-4 uppercase">Enlaces</h4>
            <ul className="space-y-2">
              <li><Link to="/categorias" className="text-white/70 hover:text-secondary transition-colors">Categorías</Link></li>
              <li><Link to="/calendario" className="text-white/70 hover:text-secondary transition-colors">Calendario</Link></li>
              <li><Link to="/inscripcion" className="text-white/70 hover:text-secondary transition-colors">Inscripciones</Link></li>
              <li><Link to="/noticias" className="text-white/70 hover:text-secondary transition-colors">Noticias</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white font-bold mb-4 uppercase">Contacto</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Avenida Panamericana, Km 9 El Cofre</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contacto@coronaclubxp.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+57 300 123 4567</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white font-bold mb-4 uppercase">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/coronaclubxp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-surface border border-white/20 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/coronaclubxp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-surface border border-white/20 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                data-testid="social-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          <p>&copy; 2026 Corona Club XP. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
