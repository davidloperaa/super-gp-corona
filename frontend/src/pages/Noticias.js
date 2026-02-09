import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Noticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setNoticias(response.data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/70">Cargando noticias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black uppercase tracking-tighter text-glow-red mb-4" data-testid="noticias-title">
            NOTICIAS
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Mantente al día con las últimas novedades y actualizaciones del campeonato.
          </p>
        </div>

        {noticias.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/70 text-lg">No hay noticias disponibles en este momento.</p>
            <p className="text-white/50 text-sm mt-2">¡Vuelve pronto para más actualizaciones!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {noticias.map((noticia, index) => (
              <article
                key={noticia.id}
                data-testid={`noticia-${index}`}
                className="bg-surface border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {noticia.imagen_url && (
                    <div className="lg:col-span-1 h-64 lg:h-auto relative overflow-hidden">
                      <img
                        src={noticia.imagen_url}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  
                  <div className={`${noticia.imagen_url ? 'lg:col-span-2' : 'lg:col-span-3'} p-8`}>
                    <div className="flex items-center space-x-4 text-white/70 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(noticia.created_at)}</span>
                      </div>
                    </div>

                    <h2 className="font-heading text-3xl font-bold uppercase mb-4 group-hover:text-primary transition-colors">
                      {noticia.titulo}
                    </h2>

                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {noticia.contenido}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
