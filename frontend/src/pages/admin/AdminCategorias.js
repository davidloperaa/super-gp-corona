import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, Edit2, X, Check } from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminCategorias = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [prices, setPrices] = useState({});
  const [groups, setGroups] = useState({});
  const [categoryGroupMap, setCategoryGroupMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', precio: 0, grupo: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ nombre: '', precio: 100000, grupo: '' });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCategories(token);
  }, [navigate]);

  const fetchCategories = async (token) => {
    try {
      const response = await axios.get(`${API}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories || []);
      setPrices(response.data.prices || {});
      setGroups(response.data.groups || {});
      setCategoryGroupMap(response.data.category_group_map || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }
    if (!newCategory.grupo) {
      alert('Debes seleccionar un grupo para la categoría');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      await axios.post(
        `${API}/admin/categories`,
        newCategory,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch to get the updated group assignments
      await fetchCategories(token);
      setNewCategory({ nombre: '', precio: 100000, grupo: '' });
      setShowAddForm(false);
      alert('Categoría creada exitosamente');
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (index) => {
    const categoria = categories[index];
    setEditingIndex(index);
    setEditForm({
      nombre: categoria,
      precio: prices[categoria] || 100000,
      grupo: categoryGroupMap[categoria] || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ nombre: '', precio: 0, grupo: '' });
  };

  const handleSaveEdit = async () => {
    if (!editForm.nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }
    if (!editForm.grupo) {
      alert('Debes seleccionar un grupo para la categoría');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('admin_token');
    const oldName = categories[editingIndex];

    try {
      await axios.put(
        `${API}/admin/categories/${encodeURIComponent(oldName)}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories(token);
      setEditingIndex(null);
      setEditForm({ nombre: '', precio: 0, grupo: '' });
      alert('Categoría actualizada exitosamente');
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al actualizar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index) => {
    const categoria = categories[index];
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${categoria}"?`)) {
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      await axios.delete(
        `${API}/admin/categories/${encodeURIComponent(categoria)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newCategories = categories.filter((_, i) => i !== index);
      setCategories(newCategories);
      
      const newPrices = { ...prices };
      delete newPrices[categoria];
      setPrices(newPrices);
      
      alert('Categoría eliminada exitosamente');
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al eliminar categoría');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar title="Gestionar Categorías" />
      <div className="min-h-screen pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="font-heading text-5xl font-black uppercase text-glow-red" data-testid="categorias-title">
              GESTIONAR CATEGORÍAS
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={saving || showAddForm}
            data-testid="btn-agregar-categoria"
            className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Categoría</span>
          </button>
        </div>

        <div className="bg-surface border border-white/10 p-6 mb-8">
          <p className="text-white/80">
            Administra las categorías de competencia. Puedes agregar nuevas, editar nombres y precios, o eliminar las que ya no necesites.
          </p>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <div className="bg-surface border-2 border-secondary p-6 mb-8" data-testid="add-category-form">
            <h3 className="font-heading font-bold uppercase mb-4 text-secondary">Nueva Categoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Nombre de la categoría</label>
                <input
                  type="text"
                  value={newCategory.nombre}
                  onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
                  placeholder="Ej: 250cc 4T Elite"
                  className="w-full bg-black/50 border border-white/20 focus:border-secondary text-white h-12 px-4 outline-none"
                  data-testid="input-new-category-name"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Grupo *</label>
                <select
                  value={newCategory.grupo}
                  onChange={(e) => setNewCategory({ ...newCategory, grupo: e.target.value })}
                  className="w-full bg-black/50 border border-white/20 focus:border-secondary text-white h-12 px-4 outline-none"
                  data-testid="select-new-category-group"
                >
                  <option value="">-- Selecciona un grupo --</option>
                  {Object.keys(groups).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Precio (COP)</label>
                <input
                  type="number"
                  value={newCategory.precio}
                  onChange={(e) => setNewCategory({ ...newCategory, precio: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/50 border border-white/20 focus:border-secondary text-white h-12 px-4 outline-none"
                  data-testid="input-new-category-price"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAddCategory}
                disabled={saving}
                className="flex items-center space-x-2 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80 transition-colors disabled:opacity-50"
                data-testid="btn-save-new-category"
              >
                <Check className="w-5 h-5" />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategory({ nombre: '', precio: 100000, grupo: '' });
                }}
                className="flex items-center space-x-2 bg-white/10 text-white font-heading font-bold uppercase px-6 py-3 hover:bg-white/20 transition-colors"
                data-testid="btn-cancel-new-category"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-surface border border-white/10">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 font-heading font-bold uppercase text-sm text-white/60">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Categoría</div>
            <div className="col-span-3">Grupo</div>
            <div className="col-span-2">Precio</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          {categories.map((categoria, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 items-center"
              data-testid={`category-row-${index}`}
            >
              {editingIndex === index ? (
                <>
                  <div className="col-span-1 text-white/40">{index + 1}</div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      className="w-full bg-black/50 border border-secondary text-white h-10 px-3 outline-none"
                      data-testid={`edit-name-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={editForm.grupo}
                      onChange={(e) => setEditForm({ ...editForm, grupo: e.target.value })}
                      className="w-full bg-black/50 border border-secondary text-white h-10 px-3 outline-none"
                      data-testid={`edit-group-${index}`}
                    >
                      <option value="">-- Sin grupo --</option>
                      {Object.keys(groups).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={editForm.precio}
                      onChange={(e) => setEditForm({ ...editForm, precio: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black/50 border border-secondary text-white h-10 px-3 outline-none"
                      data-testid={`edit-price-${index}`}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="p-2 bg-secondary text-black hover:bg-secondary/80 transition-colors disabled:opacity-50"
                      title="Guardar"
                      data-testid={`btn-save-edit-${index}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
                      title="Cancelar"
                      data-testid={`btn-cancel-edit-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-1 text-white/40">{index + 1}</div>
                  <div className="col-span-4 font-medium">{categoria}</div>
                  <div className="col-span-3 text-xs uppercase font-heading">
                    {categoryGroupMap[categoria] ? (
                      <span className="bg-accent/20 text-accent px-2 py-1">{categoryGroupMap[categoria]}</span>
                    ) : (
                      <span className="text-white/40">Sin grupo</span>
                    )}
                  </div>
                  <div className="col-span-2 text-secondary font-bold">
                    {formatPrice(prices[categoria] || 100000)}
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <button
                      onClick={() => handleStartEdit(index)}
                      disabled={saving || editingIndex !== null}
                      className="p-2 bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                      title="Editar"
                      data-testid={`btn-edit-${index}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      disabled={saving || editingIndex !== null}
                      className="p-2 bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                      title="Eliminar"
                      data-testid={`btn-delete-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="p-8 text-center text-white/40">
              No hay categorías registradas. Haz clic en &quot;Nueva Categoría&quot; para agregar una.
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-primary/10 border border-primary/30 text-sm text-white/70">
          <strong className="text-primary">Nota:</strong> Al eliminar una categoría, los participantes ya inscritos en ella mantendrán su registro, pero la categoría no estará disponible para nuevas inscripciones.
        </div>
      </div>
    </div>
    </>
  );
};
