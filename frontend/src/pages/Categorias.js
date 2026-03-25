import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, DollarSign, Flame, Flag, Car, Mountain, Bike } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Group configuration with colors and icons
const GROUP_CONFIG = {
  'VELOCIDAD TOP': {
    color: 'border-primary bg-primary/10',
    headerBg: 'bg-primary',
    icon: Flame,
    description: 'Premiación: 🥇$1.000.000 | 🥈$420.000 | 🥉$320.000'
  },
  'VELOCIDAD': {
    color: 'border-secondary bg-secondary/10',
    headerBg: 'bg-secondary',
    icon: Trophy,
    description: 'Premiación: 🥇$640.000 | 🥈$400.000 | 🥉$300.000'
  },
  'VELOCIDAD RECREATIVAS': {
    color: 'border-accent bg-accent/10',
    headerBg: 'bg-accent',
    icon: Flag,
    description: 'Sin premiación en efectivo - Trofeos'
  },
  'KARTS': {
    color: 'border-warning bg-warning/10',
    headerBg: 'bg-warning',
    icon: Car,
    description: 'Trofeos'
  },
  'VELOTIERRA': {
    color: 'border-orange-500 bg-orange-500/10',
    headerBg: 'bg-orange-500',
    icon: Mountain,
    description: 'Premiación: 🥇$300.000 | 🥈$200.000 | 🥉$100.000'
  },
  'MOTOCROSS': {
    color: 'border-green-500 bg-green-500/10',
    headerBg: 'bg-green-500',
    icon: Bike,
    description: 'Trofeos'
  }
};

// Color mapping for pricing stages
const STAGE_COLORS = {
  'green': { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
  'yellow': { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
  'orange': { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400' },
  'red-orange': { bg: 'bg-orange-600/20', border: 'border-orange-600', text: 'text-orange-500' },
  'red': { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' }
};

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [precios, setPrecios] = useState({});
  const [pricingStages, setPricingStages] = useState([]);
  const [notaDevolucion, setNotaDevolucion] = useState('');
  const [grupos, setGrupos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
    fetchPricingStages();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategorias(response.data.categorias);
      setPrecios(response.data.precios);
      setGrupos(response.data.grupos || {});
    } catch (error) {
      console.error('Error fetching categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingStages = async () => {
    try {
      const response = await axios.get(`${API}/pricing-stages`);
      setPricingStages(response.data.stages || []);
      setNotaDevolucion(response.data.nota_devolucion || '');
    } catch (error) {
      console.error('Error fetching pricing stages:', error);
    }
  };

  // Group order
  const groupOrder = ['VELOCIDAD TOP', 'VELOCIDAD', 'VELOCIDAD RECREATIVAS', 'KARTS', 'VELOTIERRA', 'MOTOCROSS'];

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
            28 categorías disponibles para todos los niveles. Encuentra la tuya y prepárate para competir.
          </p>
        </div>

        {/* Categories by Group */}
        <div className="space-y-12">
          {groupOrder.map((groupName) => {
            const groupCategories = grupos[groupName] || [];
            if (groupCategories.length === 0) return null;
            
            const config = GROUP_CONFIG[groupName] || GROUP_CONFIG['VELOCIDAD'];
            const IconComponent = config.icon;

            return (
              <div key={groupName} className="mb-12">
                {/* Group Header */}
                <div className={`${config.headerBg} p-6 mb-6`}>
                  <div className="flex items-center space-x-4">
                    <IconComponent className="w-10 h-10 text-white" />
                    <div>
                      <h2 className="font-heading text-3xl font-black uppercase text-white">
                        {groupName}
                      </h2>
                      <p className="text-white/90 text-sm mt-1">{config.description}</p>
                    </div>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupCategories.map((categoria, index) => {
                    const precio = precios[categoria] || 100000;

                    return (
                      <div
                        key={index}
                        data-testid={`categoria-card-${groupName}-${index}`}
                        className={`border-2 ${config.color} p-5 hover:scale-[1.02] transition-all duration-300 group`}
                      >
                        <h3 className="font-heading text-lg font-bold uppercase mb-3 group-hover:text-white transition-colors">
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
              </div>
            );
          })}
        </div>

        {/* Pricing Stages */}
        {pricingStages.length > 0 && (
          <div className="mt-16 bg-surface border border-white/10 p-8">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6 text-center text-glow-cyan">
              Precios de Inscripción
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(pricingStages.length, 5)} gap-4 mb-8`}>
              {pricingStages.map((stage, index) => {
                const colors = STAGE_COLORS[stage.color] || STAGE_COLORS['green'];
                return (
                  <div 
                    key={index} 
                    className={`${colors.bg} border ${colors.border} p-4 text-center`}
                  >
                    <p className="text-white/60 text-xs mb-1 uppercase font-heading">{stage.etapa}</p>
                    <p className={`font-heading font-black text-2xl ${colors.text}`}>
                      ${stage.precio.toLocaleString()}
                    </p>
                    <p className="text-white/70 text-sm mt-1">{stage.fecha}</p>
                  </div>
                );
              })}
            </div>
            {notaDevolucion && (
              <p className="text-center text-white/50 text-sm">
                {notaDevolucion}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
