import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Imágenes por defecto si no hay nada en la galería
const defaultImages = [
  {
    url: 'https://images.unsplash.com/photo-1760979191911-70a8c01ed015?crop=entropy&cs=srgb&fm=jpg&q=85',
    title: 'Motocross Extremo',
  },
  {
    url: 'https://images.unsplash.com/photo-1746690818493-128cb32d23a9?crop=entropy&cs=srgb&fm=jpg&q=85',
    title: 'Acción en la Pista',
  },
  {
    url: 'https://images.unsplash.com/photo-1752348511598-e30c96fb7cd2?crop=entropy&cs=srgb&fm=jpg&q=85',
    title: 'Karting de Alta Velocidad',
  },
];

export const Galeria = () => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      const images = response.data.images || [];
      // Si no hay imágenes en la BD, usar las por defecto
      setImagenes(images.length > 0 ? images : defaultImages);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setImagenes(defaultImages);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black uppercase tracking-tighter text-glow-red mb-4" data-testid="galeria-title">
            GALERÍA
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Revive la emoción de ediciones anteriores y prepárate para la próxima competencia.
          </p>
        </div>

        {imagenes.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg">Pronto agregaremos fotos del evento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imagenes.map((imagen, index) => (
              <div
                key={imagen.id || index}
                data-testid={`galeria-imagen-${index}`}
                className="group relative overflow-hidden border border-white/20 hover:border-primary transition-all duration-300 aspect-video"
              >
                <img
                  src={getImageUrl(imagen.url)}
                  alt={imagen.title || imagen.titulo || 'Imagen de galería'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading text-xl font-bold uppercase">{imagen.title || imagen.titulo || ''}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
