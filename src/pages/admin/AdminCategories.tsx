import { useState, useEffect } from 'react';
import { useAdminCategories } from '../../hooks/useVideos';
import { slugify } from '../../lib/utils';
import { MaterialSymbol } from '../../components/ui/MaterialSymbol';
import type { Category } from '../../types';

export function AdminCategoriesPage() {
  const { categories, loading, deleteCategory } = useAdminCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            Categories
          </h1>
          <p className="text-text-muted mt-1">
            {categories.length} category{categories.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <CategoryForm
          categoryId={editingId}
          onClose={() => {
            setIsAdding(false);
            setEditingId(null);
          }}
        />
      )}

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 text-text-muted mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
            No Categories Yet
          </h2>
          <p className="text-text-muted mb-6">
            Create categories to organize your content
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-accent-primary text-white rounded-lg"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative p-6 rounded-xl bg-bg-secondary card-glow"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
                style={{ backgroundColor: category.color }}
              />
              
              {category.icon && (
                <MaterialSymbol name={category.icon} className="text-4xl mb-2" />
              )}
              
              <h3 className="font-heading font-semibold text-text-primary">
                {category.name}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                /{category.slug}
              </p>
              {category.description && (
                <p className="text-xs text-text-muted mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="p-1.5 bg-bg-secondary/80 rounded hover:bg-bg-secondary transition-colors"
                >
                  <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l4.5-4.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this category?')) {
                      deleteCategory(category.id);
                    }
                  }}
                  className="p-1.5 bg-bg-secondary/80 rounded hover:bg-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryFormProps {
  categoryId?: string | null;
  onClose: () => void;
}

function CategoryForm({ categoryId, onClose }: CategoryFormProps) {
  const { categories, addCategory, updateCategory } = useAdminCategories();
  
  const existing = categoryId ? categories.find(c => c.id === categoryId) : null;
  
  const [name, setName] = useState(existing?.name || '');
  const [slug, setSlug] = useState(existing?.slug || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [color, setColor] = useState(existing?.color || '#e50914');
  const [icon, setIcon] = useState(existing?.icon || '');

  // Update form when existing data loads
  useEffect(() => {
    if (existing) {
      setName(existing.name || '');
      setSlug(existing.slug || '');
      setDescription(existing.description || '');
      setColor(existing.color || '#e50914');
      setIcon(existing.icon || '');
    }
  }, [existing]);
  
  const autoSlug = name && !existing ? slugify(name) : slug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !autoSlug) return;
    
    const categoryData = {
      name,
      slug: autoSlug,
      description: description || null,
      color,
      icon: icon || null,
    };
    
    if (categoryId) {
      await updateCategory(categoryId, categoryData);
    } else {
      await addCategory(categoryData as Omit<Category, 'id' | 'created_at'>);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-bg-secondary rounded-xl">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {categoryId ? 'Edit Category' : 'Add Category'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>
          
          {/* Slug (auto-generated but editable) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Slug *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">/</span>
              <input
                type="text"
                value={autoSlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="category-slug"
                className="flex-1 px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description"
              rows={2}
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
            />
          </div>
          
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>
          
          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Icon (Material Symbol)
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">Select icon</option>
              <option value="movie">movie</option>
              <option value="music_note">music_note</option>
              <option value="theaters">theaters</option>
              <option value="live_tv">live_tv</option>
              <option value="sports">sports</option>
              <option value="sports_esports">sports_esports</option>
              <option value="play_circle">play_circle</option>
              <option value="videocam">videocam</option>
              <option value="audiotrack">audiotrack</option>
              <option value="movie_filter">movie_filter</option>
              <option value="auto_awesome">auto_awesome</option>
              <option value="star">star</option>
              <option value="favorite">favorite</option>
              <option value="trending_up">trending_up</option>
              <option value="new_releases">new_releases</option>
              <option value="theater_comedy">theater_comedy</option>
            </select>
          </div>
          
          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Preview
            </label>
            <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-xl">
              {icon && <MaterialSymbol name={icon} className="text-3xl" />}
              <div>
                <h3 className="font-medium text-text-primary">{name || 'Category Name'}</h3>
                <span className="text-sm text-text-muted">/{autoSlug || 'slug'}</span>
              </div>
              <div
                className="ml-auto w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-tertiary hover:bg-border-subtle text-text-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !autoSlug}
              className="px-6 py-2 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {categoryId ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}