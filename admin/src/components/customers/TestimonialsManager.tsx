'use client';

import React, { useState, useEffect } from 'react';
import { cmsService, TestimonialItem } from '@/services/cmsService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
  Eye,
  ArrowUpDown,
  Quote
} from 'lucide-react';

export const TestimonialsManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TestimonialItem>>({
    name: '',
    quote: '',
    verified: 'Verified Buyer',
    rating: 5,
    sort_order: 1,
    status: 'ACTIVE',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cmsService.getTestimonials();
      if (res.success && res.data) {
        setTestimonials(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load customer testimonials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      quote: '',
      verified: 'Verified Buyer',
      rating: 5,
      sort_order: testimonials.length + 1,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quote: item.quote,
      verified: item.verified || 'Verified Buyer',
      rating: item.rating || 5,
      sort_order: item.sort_order || 0,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.quote?.trim()) {
      alert('Please fill in both Client Name and Review Quote.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem && editingItem.id) {
        const res = await cmsService.updateTestimonial(editingItem.id, formData);
        if (res.success && res.data) {
          setTestimonials((prev) =>
            prev.map((t) => (t.id === editingItem.id ? res.data! : t))
          );
        }
      } else {
        const res = await cmsService.createTestimonial(formData);
        if (res.success && res.data) {
          setTestimonials((prev) => [...prev, res.data!]);
        }
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer testimonial?')) return;
    try {
      await cmsService.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete testimonial');
    }
  };

  const handleToggleStatus = async (item: TestimonialItem) => {
    if (!item.id) return;
    const nextStatus = item.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await cmsService.updateTestimonial(item.id, { status: nextStatus });
      if (res.success && res.data) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: nextStatus } : t))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FAF6F0] via-white to-[#FAF4EB] border border-[#EFE6D8] p-5 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#B38548] uppercase">
              LOVE FROM OUR CUSTOMERS
            </span>
            <span className="px-2 py-0.5 bg-[#FAF4EB] text-[#B38548] border border-[#E4D7C2] text-[10px] font-bold rounded-full">
              Homepage CMS Section
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Customer Testimonials & Client Reviews Manager
          </h2>
          <p className="text-xs text-neutral-600">
            Control the live customer quotes, ratings, and verified buyer badges displayed under "WHAT OUR CLIENTS SAY" on storefront homepage.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTestimonials}
            className="p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-colors shadow-2xs"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Testimonial</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTestimonials} />
      ) : testimonials.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center space-y-3">
          <Quote className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800">No Testimonials Configured</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click "Add New Testimonial" above to add client reviews that will display on the storefront homepage.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#B38548] text-white rounded-xl text-xs font-bold hover:bg-[#9a703a] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Testimonial</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`relative bg-[#FAF6F0] border rounded-2xl p-6 text-left space-y-4 shadow-xs transition-all ${
                t.status === 'ACTIVE'
                  ? 'border-[#EFE6D8] hover:shadow-md'
                  : 'border-neutral-300 opacity-60'
              }`}
            >
              {/* Status Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-neutral-500 bg-white/80 border border-neutral-200 px-2 py-0.5 rounded-full">
                    Order: #{t.sort_order || 0}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                    }`}
                  >
                    {t.status}
                  </button>
                </div>
              </div>

              {/* Quote Content */}
              <p className="font-serif italic text-xs text-neutral-800 leading-relaxed min-h-[50px]">
                "{t.quote.replace(/^["']|["']$/g, '')}"
              </p>

              {/* Author & Actions */}
              <div className="border-t border-[#E8DEC8] pt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-bold text-xs text-neutral-900">{t.name}</h4>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t.verified || 'Verified Buyer'}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    className="p-1.5 bg-white hover:bg-neutral-100 text-neutral-700 rounded-lg border border-neutral-200 transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => t.id && handleDelete(t.id)}
                    className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-neutral-200 hover:border-rose-200 transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Drawer for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2">
                <Quote className="w-5 h-5 text-[#B38548]" />
                <h3 className="font-bold text-base text-neutral-900">
                  {editingItem ? 'Edit Client Testimonial' : 'Add New Client Testimonial'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Client / Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya R."
                  value={formData.name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white"
                />
              </div>

              {/* Review Quote */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Testimonial Quote / Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. The design, quality, and anti-tarnish finish are incredible. ARILHA is my go-to jewellery brand now!"
                  value={formData.quote || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white resize-none"
                />
              </div>

              {/* Verified Badge & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="Verified Buyer"
                    value={formData.verified || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, verified: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Rating Stars (1 to 5)
                  </label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sort_order ?? 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'ACTIVE' | 'DISABLED' }))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-black focus:bg-white"
                  >
                    <option value="ACTIVE">ACTIVE (Visible on Storefront)</option>
                    <option value="DISABLED">DISABLED (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Storefront Live Preview Card:
                </span>
                <div className="bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl p-4 space-y-2">
                  <div className="flex text-amber-400">
                    {[...Array(formData.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif italic text-xs text-neutral-700">
                    "{formData.quote || 'Your review quote preview...'}"
                  </p>
                  <div className="border-t border-[#E8DEC8] pt-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-neutral-900">{formData.name || 'Client Name'}</h4>
                      <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{formData.verified || 'Verified Buyer'}</span>
                      </span>
                    </div>
                    <span className="text-[#B38548] text-xs font-serif font-bold">ARILHA</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Update Testimonial' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
