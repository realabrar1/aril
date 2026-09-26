'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon, Loader2, Upload, X } from 'lucide-react';
import { cmsService, LifestyleSlide } from '@/services/cmsService';
import { mediaService } from '@/services/mediaService';

export default function AdminLifestyleSlidesPage() {
  const [slides, setSlides] = useState<LifestyleSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<LifestyleSlide | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<LifestyleSlide>>({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    sort_order: 1,
    status: 'ACTIVE',
    is_active: 1,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getLifestyleSlides();
      if (res.success && Array.isArray(res.data)) {
        setSlides(res.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      }
    } catch (err) {
      console.error('Failed to fetch lifestyle slides', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      sort_order: slides.length + 1,
      status: 'ACTIVE',
      is_active: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (slide: LifestyleSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      link_url: slide.link_url || '',
      sort_order: slide.sort_order || 1,
      status: 'ACTIVE',
      is_active: 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this carousel slide?')) return;
    try {
      await cmsService.deleteLifestyleSlide(id);
      fetchSlides();
    } catch (err) {
      alert('Failed to delete slide');
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await mediaService.uploadImage(file, 'cms');
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, image_url: res.data!.url }));
      } else {
        alert(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      alert('Title and Image URL are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        status: 'ACTIVE' as const,
        is_active: 1,
      };

      if (editingSlide && editingSlide.id) {
        await cmsService.updateLifestyleSlide(editingSlide.id, payload);
      } else {
        await cmsService.createLifestyleSlide(payload);
      }
      setModalOpen(false);
      fetchSlides();
    } catch (err) {
      alert('Failed to save slide');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-serif">Homepage → Lifestyle / Category Carousel</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage 3D overlapping category slides displayed on the storefront homepage under Anti-Tarnish Jewellery.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Carousel Slide</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-800">No slides added yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Click "Add Carousel Slide" to configure category slides for the storefront 3D carousel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative bg-white rounded-2xl border border-neutral-200 transition-all overflow-hidden shadow-xs hover:shadow-md"
            >
              <div className="relative h-48 bg-neutral-100">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Order #{slide.sort_order}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-neutral-900 text-base">{slide.title}</h3>
                {slide.subtitle && <p className="text-xs text-neutral-500 line-clamp-1">{slide.subtitle}</p>}
                {slide.link_url && (
                  <div className="flex items-center text-xs text-neutral-400 space-x-1 pt-1">
                    <LinkIcon className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{slide.link_url}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Active
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(slide)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => slide.id && handleDelete(slide.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Slide */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold font-serif text-neutral-900 border-b pb-3">
              {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Title (e.g. DAILY WEAR) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="OFFICE WEAR"
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Anti-tarnish minimalist chains & hoops"
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Slide Image *
                </label>
                
                <div className="space-y-3">
                  {/* File Upload Button */}
                  <div>
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs w-full">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Uploading File...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-white" />
                          <span>Choose & Upload Image File from Device</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Manual URL / Path Input */}
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Or Enter Image URL / Local Path:
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="e.g. /images/hero1_image.png or https://..."
                      className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>

                  {/* Image Preview Box */}
                  {formData.image_url && (
                    <div className="relative h-32 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                      <img
                        src={formData.image_url}
                        alt="Slide Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1 rounded-full text-xs transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Destination Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/collections/chains"
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.sort_order || 1}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Slide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
