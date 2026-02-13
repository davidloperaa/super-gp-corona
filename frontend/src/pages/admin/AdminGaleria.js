import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Image, Upload, Trash2, GripVertical, X, Plus, Save, 
  AlertCircle, CheckCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const AdminGaleria = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchGallery();
  }, [navigate]);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      setGallery(response.data.images || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar galería' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('admin_token');
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.split('.')[0]);

        await axios.post(`${API}/admin/gallery`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        setMessage({ type: 'error', text: `Error al subir ${file.name}` });
      }
    }

    setUploading(false);
    setMessage({ type: 'success', text: '¡Imágenes agregadas exitosamente!' });
    fetchGallery();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/admin/gallery/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Imagen eliminada' });
      fetchGallery();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar imagen' });
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newGallery = [...gallery];
    const draggedImage = newGallery[draggedItem];
    newGallery.splice(draggedItem, 1);
    newGallery.splice(index, 0, draggedImage);
    
    setGallery(newGallery);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const order = gallery.map(img => img.id);
      await axios.put(`${API}/admin/gallery/reorder`, order, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Orden actualizado' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al reordenar' });
      fetchGallery();
    }
    
    setDraggedItem(null);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl font-black uppercase text-glow-red">
            GESTIÓN DE GALERÍA
          </h1>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div 
          className="bg-surface border-2 border-dashed border-white/20 rounded-xl p-8 mb-8 hover:border-primary/50 transition-colors cursor-pointer text-center"
          onClick={() => fileInputRef.current?.click()}
          data-testid="upload-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-white">Subiendo imágenes...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-white text-lg font-bold mb-2">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-white/50 text-sm">
                JPG, PNG, GIF o WebP (máx. 10MB por imagen)
              </p>
            </>
          )}
        </div>

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-xl p-12 text-center">
            <Image className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50">No hay imágenes en la galería</p>
            <p className="text-white/30 text-sm mt-2">
              Sube algunas imágenes para mostrar en tu sitio
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/70 flex items-center space-x-2">
                <GripVertical className="w-4 h-4" />
                <span>Arrastra para reordenar</span>
              </p>
              <span className="text-white/50 text-sm">{gallery.length} imágenes</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group aspect-video bg-black rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                    draggedItem === index 
                      ? 'border-primary scale-105 opacity-80' 
                      : 'border-transparent hover:border-white/30'
                  }`}
                  data-testid={`gallery-item-${image.id}`}
                >
                  <img
                    src={getImageUrl(image.url)}
                    alt={image.title || 'Imagen de galería'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      data-testid={`delete-image-${image.id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
