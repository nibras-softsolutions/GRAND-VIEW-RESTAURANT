'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  AlertCircle,
  Check,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('UtensilsCrossed');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data?.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('UtensilsCrossed');
    setDisplayOrder(String(categories.length + 1));
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'UtensilsCrossed');
    setDisplayOrder(String(cat.display_order || 0));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      const isEditing = Boolean(editingCategory);
      const url = '/api/admin/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = isEditing
        ? {
            id: editingCategory.id,
            name: name.trim(),
            description: description.trim(),
            icon,
            display_order: Number(displayOrder) || 0,
            active: editingCategory.active !== false,
          }
        : {
            name: name.trim(),
            description: description.trim(),
            icon,
            display_order: Number(displayOrder) || 0,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save category');
      }
    } catch (err) {
      setFormError('Network error while saving category');
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          name: cat.name,
          active: !cat.active,
        }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, active: !cat.active } : c))
        );
      }
    } catch (e) {
      console.error('Failed to toggle category', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1814]">
            Category Management
          </h2>
          <p className="text-xs text-[#77736C]">
            Organize customer menu sections, icons, and display ordering.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-gold py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#77736C]">
          <div className="w-6 h-6 border-2 border-[#C99A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                cat.active ? 'border-[#E6E1D5]' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] flex items-center justify-center text-[#C99A4A] font-bold">
                    <FolderTree className="w-5 h-5" />
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cat.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#1A1814]">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#77736C] mt-1 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>

                <div className="mt-3 flex items-center gap-3 text-[11px] text-[#77736C]">
                  <span>Order: #{cat.display_order}</span>
                  <span>•</span>
                  <span>{cat.item_count || 0} active dishes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(cat)}
                  className={`text-xs font-semibold ${
                    cat.active ? 'text-amber-700 hover:underline' : 'text-emerald-700 hover:underline'
                  }`}
                >
                  {cat.active ? 'Disable' : 'Enable'}
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] hover:border-[#C99A4A] text-xs font-semibold text-[#1A1814] flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E6E1D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D5]">
              <h3 className="font-serif text-lg font-bold text-[#1A1814]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#77736C] hover:text-[#1A1814]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Seafood Specialties"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Appears in category menu header..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs sm:text-sm focus:outline-hidden focus:border-[#C99A4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1814] mb-1">
                    Icon Name
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs"
                  >
                    <option value="UtensilsCrossed">Utensils</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Coffee">Beverage</option>
                    <option value="Cake">Cake / Dessert</option>
                    <option value="Salad">Salad</option>
                    <option value="Sandwich">Snack</option>
                    <option value="Soup">Soup</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#77736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold py-2.5 px-6 text-xs font-semibold"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
