import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [precios, setPrecios] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategorias(response.data.categorias);
      setPrecios(response.data.precios);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryType = (cat) => {
    if (cat.includes('INFANTIL') || cat.includes('Infantil')) return 'infantil';
    if (cat.includes('Kart')) return 'karts';
    if (cat.includes('Motocross')) return 'motocross';
    if (cat.includes('Veloarena')) return 'veloarena';
    if (cat.includes('Élite') || cat.includes('Elite')) return 'elite';
    return 'general';
  };

  const getCategoryColor = (type) => {
    const colors = {
      infantil: 'border-warning',
      karts: 'border-secondary',
      motocross: 'border-primary',
      veloarena: 'border-accent',
      elite: 'border-primary',
      general: 'border-white/20',
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/70">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black uppercase tracking-tighter text-glow-red mb-4" data-testid="categorias-title">
            CATEGORÍAS
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            32 categorías disponibles para todos los niveles y edades. Encuentra la tuya y prepárate para competir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((categoria, index) => {
            const type = getCategoryType(categoria);
            const color = getCategoryColor(type);
            const precio = precios[categoria] || 0;

            return (
              <div
                key={index}
                data-testid={`categoria-card-${index}`}
                className={`bg-surface border-2 ${color} p-6 hover:border-opacity-100 transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                  <span className={`text-xs uppercase font-heading font-bold px-2 py-1 border ${color}`}>
                    {type}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold uppercase mb-3 group-hover:text-primary transition-colors">
                  {categoria}
                </h3>

                <div className="flex items-center space-x-2 text-white/70">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-heading font-bold">
                    COP {precio.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-surface border border-white/10 p-8">
          <h2 className="font-heading text-2xl font-bold uppercase mb-4 text-center">Información Importante</h2>
          <ul className="space-y-3 text-white/80 max-w-3xl mx-auto">
            <li className="flex items-start space-x-3">
              <span className="text-primary font-bold">•</span>
              <span>Los precios mostrados corresponden a la fase actual de inscripción.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-primary font-bold">•</span>
              <span>Puedes inscribirte en múltiples categorías si cumples los requisitos.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-primary font-bold">•</span>
              <span>Los precios varían según la fase: Preventa (15% descuento), Ordinaria (precio normal), Extraordinaria (+20%).</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-primary font-bold">•</span>
              <span>Cupones de descuento disponibles: 30%, 50% y 100% según disponibilidad.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
