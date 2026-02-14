import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Check, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = ['Datos Personales', 'Categorías', 'Resumen y Pago'];

export const Inscripcion = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [precios, setPrecios] = useState({});
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponValido, setCuponValido] = useState(false);
  const [precioCalculado, setPrecioCalculado] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    numero_competicion: '',
    celular: '',
    correo: '',
    liga: '',
    categorias: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (formData.categorias.length > 0) {
      calcularPrecio();
    }
  }, [formData.categorias, codigoCupon]);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategorias(response.data.categorias);
      setPrecios(response.data.precios);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const calcularPrecio = async () => {
    try {
      const response = await axios.post(`${API}/registrations/calculate`, {
        categorias: formData.categorias,
        codigo_cupon: codigoCupon || null,
      });
      setPrecioCalculado(response.data);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const validarCupon = async () => {
    if (!codigoCupon) return;
    try {
      const response = await axios.post(`${API}/coupons/validate`, {
        codigo: codigoCupon,
      });
      if (response.data.valido) {
        setCuponValido(true);
        calcularPrecio();
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Cupón inválido');
      setCuponValido(false);
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      if (!formData.nombre) newErrors.nombre = 'Nombre requerido';
      if (!formData.apellido) newErrors.apellido = 'Apellido requerido';
      if (!formData.cedula) newErrors.cedula = 'Cédula requerida';
      if (!formData.numero_competicion) newErrors.numero_competicion = 'Número de competición requerido';
      if (!formData.celular) newErrors.celular = 'Celular requerido';
      if (!formData.correo) newErrors.correo = 'Correo requerido';
      if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
        newErrors.correo = 'Correo inválido';
      }
    }

    if (currentStep === 1) {
      if (formData.categorias.length === 0) {
        newErrors.categorias = 'Debe seleccionar al menos una categoría';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoriaToggle = (categoria) => {
    setFormData((prev) => {
      const categorias = prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria];
      return { ...prev, categorias };
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/registrations`, {
        ...formData,
        codigo_cupon: codigoCupon || null,
      });

      const registration = response.data;
      
      if (registration.precio_final === 0) {
        alert(`¡Inscripción completada! Cupón 100% aplicado. Recibirás confirmación por email.`);
        navigate('/pago-exitoso?registration_id=' + registration.id);
      } else {
        const paymentResponse = await axios.post(`${API}/payments/create-preference`, {
          registration_id: registration.id
        });
        
        window.location.href = paymentResponse.data.init_point;
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al procesar inscripción';
      alert(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-6xl md:text-7xl font-black uppercase tracking-tighter text-glow-red mb-4" data-testid="inscripcion-title">
            INSCRIPCIÓN
          </h1>
          <p className="text-white/80 text-lg">
            Completa el formulario para asegurar tu lugar en el campeonato.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    data-testid={`step-indicator-${index}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold border-2 transition-colors ${
                      index <= currentStep
                        ? 'bg-primary border-primary text-white'
                        : 'bg-surface border-white/20 text-white/50'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 font-heading uppercase text-center">{step}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      index < currentStep ? 'bg-primary' : 'bg-white/20'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-white/10 p-8">
          {currentStep === 0 && (
            <div className="space-y-6" data-testid="step-datos-personales">
              <h2 className="font-heading text-2xl font-bold uppercase mb-6">Datos Personales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    data-testid="input-nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                  {errors.nombre && <p className="text-primary text-sm mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    data-testid="input-apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                  {errors.apellido && <p className="text-primary text-sm mt-1">{errors.apellido}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Cédula *</label>
                  <input
                    type="text"
                    name="cedula"
                    data-testid="input-cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                  {errors.cedula && <p className="text-primary text-sm mt-1">{errors.cedula}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Número de Competición *</label>
                  <input
                    type="text"
                    name="numero_competicion"
                    data-testid="input-numero-competicion"
                    value={formData.numero_competicion}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                  {errors.numero_competicion && <p className="text-primary text-sm mt-1">{errors.numero_competicion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Celular *</label>
                  <input
                    type="tel"
                    name="celular"
                    data-testid="input-celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                  {errors.celular && <p className="text-primary text-sm mt-1">{errors.celular}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    data-testid="input-correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                  {errors.correo && <p className="text-primary text-sm mt-1">{errors.correo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold mb-2">Liga a la que está afiliado</label>
                  <input
                    type="text"
                    name="liga"
                    data-testid="input-liga"
                    value={formData.liga}
                    onChange={handleInputChange}
                    placeholder="Ej: Liga del Cauca"
                    className="w-full bg-black/50 border border-white/20 focus:border-primary text-white h-12 px-4 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div data-testid="step-categorias">
              <h2 className="font-heading text-2xl font-bold uppercase mb-6">Selecciona tus Categorías</h2>
              <p className="text-white/70 mb-6">Puedes seleccionar múltiples categorías si cumples los requisitos.</p>
              
              {errors.categorias && (
                <div className="bg-primary/20 border border-primary p-4 mb-6">
                  <p className="text-primary font-bold">{errors.categorias}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {categorias.map((categoria, index) => (
                  <div
                    key={index}
                    data-testid={`categoria-checkbox-${index}`}
                    onClick={() => handleCategoriaToggle(categoria)}
                    className={`p-4 border-2 cursor-pointer transition-all ${
                      formData.categorias.includes(categoria)
                        ? 'border-primary bg-primary/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 border-2 flex items-center justify-center mt-0.5 ${
                          formData.categorias.includes(categoria)
                            ? 'border-primary bg-primary'
                            : 'border-white/40'
                        }`}
                      >
                        {formData.categorias.includes(categoria) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-heading font-bold text-sm">{categoria}</p>
                        <p className="text-white/70 text-xs mt-1">
                          COP {precios[categoria]?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div data-testid="step-resumen">
              <h2 className="font-heading text-2xl font-bold uppercase mb-6">Resumen de Inscripción</h2>
              
              <div className="space-y-6">
                <div className="bg-black/50 p-6 border border-white/10">
                  <h3 className="font-heading font-bold mb-4">Datos del Piloto</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Nombre:</p>
                      <p className="font-bold">{formData.nombre} {formData.apellido}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Cédula:</p>
                      <p className="font-bold">{formData.cedula}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Número:</p>
                      <p className="font-bold">{formData.numero_competicion}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Celular:</p>
                      <p className="font-bold">{formData.celular}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 p-6 border border-white/10">
                  <h3 className="font-heading font-bold mb-4">Categorías Seleccionadas ({formData.categorias.length})</h3>
                  <ul className="space-y-2">
                    {formData.categorias.map((cat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="text-primary">•</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/50 p-6 border border-white/10">
                  <h3 className="font-heading font-bold mb-4">Cupón de Descuento (Opcional)</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      data-testid="input-cupon"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                      placeholder="CODIGO123"
                      className="flex-1 bg-black/50 border border-white/20 focus:border-secondary text-white h-12 px-4 outline-none uppercase"
                    />
                    <button
                      onClick={validarCupon}
                      data-testid="btn-validar-cupon"
                      className="bg-secondary text-black font-heading font-bold uppercase px-6 hover:bg-secondary/80 transition-colors"
                    >
                      Validar
                    </button>
                  </div>
                  {cuponValido && (
                    <p className="text-secondary text-sm mt-2">✓ Cupón aplicado correctamente</p>
                  )}
                </div>

                {precioCalculado && (
                  <div className="bg-primary/20 border-2 border-primary p-6">
                    <h3 className="font-heading text-xl font-bold uppercase mb-4">Desglose de Precio</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Precio Base:</span>
                        <span className="font-bold">COP {precioCalculado.precio_base.toLocaleString()}</span>
                      </div>
                      {precioCalculado.descuento > 0 && (
                        <div className="flex justify-between text-secondary">
                          <span>Descuento:</span>
                          <span className="font-bold">- COP {precioCalculado.descuento.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex justify-between text-xl">
                          <span className="font-heading font-black uppercase">Total:</span>
                          <span className="font-heading font-black text-primary">
                            COP {precioCalculado.precio_final.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-white/70 mt-2">
                        Fase actual: <span className="font-bold uppercase">{precioCalculado.fase_actual}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                data-testid="btn-prev"
                className="flex items-center space-x-2 bg-surface text-white font-heading font-bold uppercase px-6 py-3 border border-white/20 hover:border-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                data-testid="btn-next"
                className="ml-auto flex items-center space-x-2 bg-primary text-white font-heading font-bold uppercase px-6 py-3 hover:bg-primary/80 transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                data-testid="btn-submit"
                className="ml-auto flex items-center space-x-2 bg-primary text-white font-heading font-black uppercase px-8 py-4 skew-racing hover:skew-x-0 transition-transform border-2 border-transparent hover:border-white disabled:opacity-50"
              >
                <span className="unskew flex items-center space-x-2">
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Confirmar Inscripción</span>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
