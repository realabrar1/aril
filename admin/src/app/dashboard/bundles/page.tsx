'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit3, Trash2, Package, Tag, Calendar, RefreshCw, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/services/apiClient';

interface BundleItem {
  id?: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  product?: any;
}

interface ProductBundle {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  original_total_price: number;
  bundle_price: number;
  savings_amount: number;
  status: 'ACTIVE' | 'INACTIVE';
  start_at?: string;
  end_at?: string;
  priority: number;
  items: BundleItem[];
}

export default function ProductBundlesAdminPage() {
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<ProductBundle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ProductBundle>>({
    name: '',
    description: '',
    image_url: '',
    bundle_price: 999,
    status: 'ACTIVE',
    priority: 0,
    items: [],
  });

  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedItemQty, setSelectedItemQty] = useState<number>(1);

  useEffect(() => {
    loadBundles();
    loadProducts();
  }, []);

  const loadBundles = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>('/api/v1/admin/bundles');
      if (res.success && res.data) {
        setBundles(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await apiClient.get<any>('/api/v1/admin/products');
      if (res.success && res.data) {
        setProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (bundle?: ProductBundle) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData(bundle);
    } else {
      setEditingBundle(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        bundle_price: 999,
        status: 'ACTIVE',
        priority: 0,
        items: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleAddItemToForm = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === Number(selectedProductId));
    if (!prod) return;

    const existingItems = formData.items || [];
    const updated = [
      ...existingItems,
      {
        product_id: prod.id,
        variant_id: prod.variants?.[0]?.id || null,
        quantity: selectedItemQty,
        product: prod,
      },
    ];

    setFormData({ ...formData, items: updated });
    setSelectedProductId('');
    setSelectedItemQty(1);
  };

  const handleRemoveItemFromForm = (idx: number) => {
    const updated = (formData.items || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, items: updated });
  };

  // Calculate estimated original total
  const calculatedOriginalTotal = (formData.items || []).reduce((acc, item) => {
    const prod = item.product || products.find((p) => p.id === item.product_id);
    const price = prod?.variants?.[0]?.price ?? (prod?.base_price || 0);
    return acc + (Number(price) * item.quantity);
  }, 0);

  const calculatedSavings = Math.max(0, calculatedOriginalTotal - (formData.bundle_price || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.bundle_price) {
      alert('Please fill in bundle name and price');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      alert('Please add at least one product to the bundle');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingBundle?.id) {
        const res = await apiClient.put<any>(`/api/v1/admin/bundles/${editingBundle.id}`, formData);
        if (res.success) {
          setMessage({ type: 'success', text: 'Product bundle updated successfully!' });
        }
      } else {
        const res = await apiClient.post<any>('/api/v1/admin/bundles', formData);
        if (res.success) {
          setMessage({ type: 'success', text: 'New product bundle created successfully!' });
        }
      }
      setIsModalOpen(false);
      loadBundles();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save product bundle' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product bundle?')) return;
    try {
      await apiClient.delete(`/api/v1/admin/bundles/${id}`);
      loadBundles();
    } catch (err) {
      alert('Failed to delete bundle');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Product Bundles Manager
          </h1>
          <p className="text-xs text-neutral-500">
            Create multi-product jewellery sets with automated savings calculation &amp; server-side price validation
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bundle</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Bundles Grid */}
      <Card title="Configured Product Bundles">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#B38548] animate-spin" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center p-12 text-xs text-neutral-500 space-y-2">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-700">No Product Bundles Created Yet</p>
            <p>Combine matching jewellery pieces into curated sets with special bundle pricing!</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundles.map((b) => (
              <div key={b.id} className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#B38548] text-white font-bold text-[9px] rounded-md uppercase tracking-wider">
                          BUNDLE
                        </span>
                        <span className={`px-2 py-0.5 font-bold text-[9px] rounded-md border ${
                          b.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-neutral-900 mt-1">{b.name}</h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{b.description || 'Curated Jewellery Set'}</p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleOpenModal(b)}
                        className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white p-3 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-bold">Individual Total</span>
                      <span className="font-mono text-neutral-500 line-through">₹{Number(b.original_total_price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#B38548] block uppercase font-bold">Bundle Price</span>
                      <span className="font-mono font-extrabold text-sm text-neutral-900">₹{Number(b.bundle_price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-[10px] font-bold text-center">
                      Save ₹{Number(b.savings_amount).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Included Items */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase block">Included Products ({b.items?.length || 0}):</span>
                    <div className="space-y-1">
                      {b.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-neutral-700 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-100">
                          <span className="font-medium line-clamp-1">{it.product?.name || `Product #${it.product_id}`}</span>
                          <span className="font-bold text-neutral-900 shrink-0">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal for Create / Edit Bundle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-neutral-900">
                {editingBundle ? 'Edit Product Bundle' : 'Create New Product Bundle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Bundle Name *"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Everyday Jewellery Set"
              />

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 block">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short marketing description of what makes this jewellery bundle special..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Special Bundle Price (₹) *"
                  type="number"
                  value={formData.bundle_price || ''}
                  onChange={(e) => setFormData({ ...formData, bundle_price: parseFloat(e.target.value) || 0 })}
                  placeholder="1199"
                />
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Status</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Add Items Section */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider">Select Products for Bundle</h4>

                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl bg-white text-xs font-medium"
                  >
                    <option value="">Select product to include...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.variants?.[0]?.price || p.base_price})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selectedItemQty}
                    onChange={(e) => setSelectedItemQty(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-2 border border-neutral-300 rounded-xl text-xs text-center font-bold"
                  />

                  <button
                    type="button"
                    onClick={handleAddItemToForm}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {/* Added Items Preview */}
                {formData.items && formData.items.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">Selected Items in Bundle:</span>
                    {formData.items.map((it, idx) => {
                      const prod = it.product || products.find((p) => p.id === it.product_id);
                      return (
                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-neutral-200">
                          <span className="font-medium text-neutral-800">{prod?.name || `Product #${it.product_id}`}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-neutral-900">Qty: {it.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromForm(idx)}
                              className="text-neutral-400 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Automatic Savings Preview */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
                <span>Estimated Individual Total: <strong>₹{calculatedOriginalTotal.toLocaleString('en-IN')}</strong></span>
                <span className="font-bold">Calculated Savings: ₹{calculatedSavings.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold text-neutral-700"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Product Bundle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
