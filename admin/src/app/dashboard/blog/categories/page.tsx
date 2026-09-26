'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, FolderTree, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { blogAdminService, BlogCategory } from '@/services/blogAdminService';

export default function BlogCategoriesAdminPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await blogAdminService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sort_order: cat.sort_order || 0,
    });
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', sort_order: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      let res;
      if (editingCategory) {
        res = await blogAdminService.updateCategory(editingCategory.id, formData);
      } else {
        res = await blogAdminService.createCategory(formData);
      }

      if (res.success) {
        setMessage({
          type: 'success',
          text: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
        });
        handleCancel();
        loadCategories();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save category.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete blog category "${name}"?`)) return;

    try {
      const res = await blogAdminService.deleteCategory(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setMessage({ type: 'success', text: 'Category deleted successfully.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete category.' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <h1 className="text-2xl font-bold text-neutral-900 font-serif flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-[#B38548]" />
          <span>Blog Categories Manager</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Organize articles into relational topics (e.g. Jewellery Care, Styling Guides, Kundan Heritage, Anti-Tarnish, Gift Ideas).
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                Category Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  }))
                }
                placeholder="e.g. Jewellery Care"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                URL Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  }))
                }
                placeholder="jewellery-care"
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this blog category..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button type="submit" disabled={isSaving} className="bg-[#B38548] hover:bg-[#966C32] text-white">
                {isSaving ? 'Saving...' : editingCategory ? 'Update' : 'Create Category'}
              </Button>
              {editingCategory && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* List Column */}
        <Card className="p-0 lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Articles</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-neutral-400">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-neutral-400">
                      No blog categories created yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">{cat.name}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">{cat.slug}</td>
                      <td className="py-3.5 px-4 font-bold text-[#B38548]">{cat.posts_count || 0}</td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-neutral-400 hover:text-[#B38548] rounded-lg hover:bg-amber-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
