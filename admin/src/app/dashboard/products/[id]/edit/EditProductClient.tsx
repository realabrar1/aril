'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/services/apiClient';
import { categoryService } from '@/services/categoryService';
import { collectionService, Collection } from '@/services/collectionService';
import { mediaService } from '@/services/mediaService';
import { Category, Product, ProductVariant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Sparkles, Trash2, Edit3, Save, Layers, Upload, ImagePlus, CheckCircle2 } from 'lucide-react';

export default function EditProductClient() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: 'ARILHA',
    gender: 'WOMEN',
    status: 'ACTIVE',
    category_id: '',
    description: '',
    short_description: '',
  });

  interface ProductImageItem {
    image_url: string;
    color_name: string | null;
  }

  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);

  // Variant Generator State
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [selectedColorsText, setSelectedColorsText] = useState('Midnight Black, Ivory White');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [basePrice, setBasePrice] = useState('1499');
  const [baseMrp, setBaseMrp] = useState('1999');
  const [baseStock, setBaseStock] = useState('15');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Single Variant Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editForm, setEditForm] = useState({
    sku: '',
    size: '',
    color: '',
    color_code: '#000000',
    price: '',
    mrp: '',
    stock: '',
  });
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const loadProduct = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, colRes] = await Promise.all([
        apiClient<Product & { collections?: Collection[] }>(`/admin/products/${productId}`),
        categoryService.getCategories(),
        collectionService.getCollections(),
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      if (colRes.success && colRes.data) {
        setCollections(colRes.data);
      }

      if (prodRes.success && prodRes.data) {
        const p = prodRes.data;
        setProduct(p);
        setSelectedCollectionIds(p.collections ? p.collections.map((c) => c.id) : []);
        setFormData({
          name: p.name || '',
          sku: p.sku || '',
          brand: p.brand || 'ARILHA',
          gender: p.gender || 'WOMEN',
          status: p.status || 'ACTIVE',
          category_id: p.category_id ? String(p.category_id) : '',
          description: p.description || '',
          short_description: p.short_description || '',
        });

        if (p.images && p.images.length > 0) {
          setProductImages(
            p.images.map((img) => ({
              image_url: img.image_url,
              color_name: img.color_name || null,
            }))
          );
        }
      } else {
        setError(prodRes.message || 'Product not found.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading product details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    setIsUploadingImage(true);
    for (const file of selectedFiles) {
      const localPreviewUrl = URL.createObjectURL(file);
      setProductImages((prev) => [...prev, { image_url: localPreviewUrl, color_name: null }]);

      try {
        const res = await mediaService.uploadImage(file, 'products');
        if (res.success && res.data) {
          const uploadedUrl = res.data.url;
          setProductImages((prev) =>
            prev.map((img) => (img.image_url === localPreviewUrl ? { ...img, image_url: uploadedUrl } : img))
          );
        } else {
          showToast(res.message || 'Image upload failed.', 'error');
          setProductImages((prev) => prev.filter((img) => img.image_url !== localPreviewUrl));
        }
      } catch (err) {
        showToast('Image upload failed.', 'error');
        setProductImages((prev) => prev.filter((img) => img.image_url !== localPreviewUrl));
      }
    }
    setIsUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setImageColor = (index: number, colorName: string) => {
    setProductImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, color_name: colorName || null } : img))
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);

    try {
      const formattedImagesPayload = productImages.map((img, idx) => ({
        image_url: img.image_url,
        color_name: img.color_name || null,
        is_primary: idx === 0,
        sort_order: idx + 1,
      }));

      const res = await apiClient<Product>(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          brand: formData.brand,
          gender: formData.gender,
          status: formData.status,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          collection_ids: selectedCollectionIds,
          description: formData.description,
          short_description: formData.short_description,
          images: formattedImagesPayload,
        }),
      });

      if (res.success) {
        showToast('Product details and images saved successfully.', 'success');
        loadProduct();
      } else {
        showToast(res.message || 'Failed to save product.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating product.', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleGenerateVariants = async (e: React.FormEvent) => {
    e.preventDefault();
    const colors = selectedColorsText.split(',').map((c) => c.trim()).filter(Boolean);
    if (colors.length === 0 || selectedSizes.length === 0) {
      showToast('Please specify at least 1 color and 1 size.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiClient<Product>(`/admin/products/${productId}/variants/generate`, {
        method: 'POST',
        body: JSON.stringify({
          colors,
          sizes: selectedSizes,
          base_price: parseFloat(basePrice),
          base_mrp: parseFloat(baseMrp),
          base_stock: parseInt(baseStock, 10),
        }),
      });

      if (res.success && res.data) {
        showToast(res.message || 'Variants matrix generated successfully.', 'success');
        setProduct(res.data);
        setGeneratorModalOpen(false);
      } else {
        showToast(res.message || 'Unable to generate variants.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error generating variants matrix.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setEditForm({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      color_code: variant.color_code || '#000000',
      price: variant.price.toString(),
      mrp: variant.mrp.toString(),
      stock: variant.stock.toString(),
    });
    setEditModalOpen(true);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    setIsSavingVariant(true);
    try {
      const res = await apiClient<ProductVariant>(`/admin/products/${productId}/variants/${editingVariant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          sku: editForm.sku,
          size: editForm.size,
          color: editForm.color,
          color_code: editForm.color_code,
          price: parseFloat(editForm.price),
          mrp: parseFloat(editForm.mrp),
          stock: parseInt(editForm.stock, 10),
        }),
      });

      if (res.success) {
        showToast('Variant updated successfully.', 'success');
        setEditModalOpen(false);
        loadProduct();
      } else {
        showToast(res.message || 'Unable to save variant.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving variant.', 'error');
    } finally {
      setIsSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const res = await apiClient(`/admin/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('Variant removed.', 'success');
        loadProduct();
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting variant.', 'error');
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return <div className="p-8 text-center text-xs font-bold text-rose-600">{error || 'Product not found.'}</div>;
  }

  const variants = product.variants || [];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm" className="!p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Edit {product.name}</h1>
            <p className="text-xs text-neutral-500">Manage product photos, details, prices & size/color matrix</p>
          </div>
        </div>

        <Button type="button" onClick={handleSaveProduct} isLoading={isSavingProduct} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
          Save Product Changes
        </Button>
      </div>

      {/* 1. Basic Product Info & Details Form */}
      <Card title="1. Product Information & Category">
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Title"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Master SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              options={[
                { label: '-- Select Category --', value: '' },
                ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
              ]}
              required
            />

          {/* Collections Multi-Select Checklist */}
          <div className="sm:col-span-3 space-y-2 p-3 bg-[#FAF6F0] rounded-xl border border-[#B38548]/30">
            <label className="font-bold text-xs text-neutral-900 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#B38548]" />
              <span>Assigned Collections (Select Multiple)</span>
            </label>
            <p className="text-[11px] text-neutral-500">
              Select all collections this product should belong to (e.g. Earrings, Diwali Edit, New Arrivals, Best Sellers).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {collections.map((col) => {
                const isChecked = selectedCollectionIds.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-amber-100/80 border-amber-400 font-bold text-neutral-900'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedCollectionIds((prev) =>
                          prev.includes(col.id) ? prev.filter((id) => id !== col.id) : [...prev, col.id]
                        );
                      }}
                      className="rounded border-neutral-300 text-[#B38548] focus:ring-[#B38548] w-4 h-4"
                    />
                    <span className="truncate">{col.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: 'Active (Visible on store)', value: 'ACTIVE' },
                { label: 'Draft (Hidden)', value: 'DRAFT' },
                { label: 'Archived', value: 'ARCHIVED' },
              ]}
            />
            <Select
              label="Gender / Target"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { label: 'Women', value: 'WOMEN' },
                { label: 'Unisex', value: 'UNISEX' },
              ]}
            />
          </div>

          <Textarea
            label="Short Description"
            rows={2}
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
          />

          <Textarea
            label="Full Detailed Description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isSavingProduct} size="sm">
              Save Basic Information
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Product Gallery Photos */}
      <Card title="2. Product Gallery Photos & Color Links">
        <div className="space-y-4">
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#B38548]/30 text-xs space-y-1">
            <span className="font-bold text-neutral-900 block flex items-center gap-1.5">
              💡 Product Photo Assignment Guide:
            </span>
            <ul className="list-disc list-inside text-[11px] text-neutral-600 space-y-0.5">
              <li><strong className="text-[#B38548]">1st Image (Position 1):</strong> Primary / Main Template Image (shown as default catalog photo).</li>
              <li><strong className="text-neutral-900">2nd Image (Position 2):</strong> Hover Image (shown automatically when customer hovers over product card).</li>
              <li><strong>3rd+ Images:</strong> Additional Gallery &amp; Angle Photos.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Upload photos and link them to colors. The 1st image is Main/Template, 2nd image is Hover photo.
            </p>
            <label className="inline-flex items-center space-x-2 px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-neutral-800 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingImage ? 'Uploading...' : 'Upload Photos'}</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
            </label>
          </div>

          {productImages.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
              <ImagePlus className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-neutral-600">No images uploaded yet</p>
              <p className="text-[11px] text-neutral-400">Click upload photos to attach images to this product.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <div key={idx} className="relative group border border-neutral-200 rounded-xl p-2 bg-neutral-50 space-y-2">
                  <div className="relative h-40 w-full rounded-lg overflow-hidden bg-white">
                    <Image src={img.image_url} alt={`Product Image ${idx + 1}`} fill className="object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-[#B38548] text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                        1ST: MAIN (TEMPLATE)
                      </span>
                    )}
                    {idx === 1 && (
                      <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                        2ND: HOVER PHOTO
                      </span>
                    )}
                    {idx > 1 && (
                      <span className="absolute top-2 left-2 bg-neutral-700/80 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                        GALLERY #{idx + 1}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block uppercase">Link to Color Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Midnight Black"
                      value={img.color_name || ''}
                      onChange={(e) => setImageColor(idx, e.target.value)}
                      className="w-full text-xs font-bold px-2 py-1 border border-neutral-200 rounded bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="button" onClick={handleSaveProduct} isLoading={isSavingProduct} size="sm" variant="outline">
              Save Gallery Photos
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Variants & Stock Matrix */}
      <Card title="3. Product Variants & Inventory Matrix">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <p className="text-xs font-bold text-neutral-800">Available Variants ({variants.length})</p>
              <p className="text-[11px] text-neutral-500">Each size and color combination has unique price and stock</p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setGeneratorModalOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Generate Variants Matrix
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="p-8 border border-neutral-200 rounded-xl text-center bg-neutral-50">
              <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-neutral-700">No variants generated for this product</p>
              <p className="text-[11px] text-neutral-500 mb-4">Click "Generate Variants Matrix" to create size/color options.</p>
              <Button size="sm" onClick={() => setGeneratorModalOpen(true)} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Auto-Generate Matrix
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Color</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">MRP</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                  {variants.map((v) => (
                    <tr key={v.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-mono text-[11px]">{v.sku}</td>
                      <td className="p-3 font-bold">{v.size}</td>
                      <td className="p-3 flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-xs" style={{ backgroundColor: v.color_code || '#000' }} />
                        <span>{v.color}</span>
                      </td>
                      <td className="p-3 font-bold text-neutral-900">₹{v.price}</td>
                      <td className="p-3 text-neutral-400 line-through">₹{v.mrp}</td>
                      <td className="p-3">
                        <Badge variant={v.stock > 5 ? 'success' : v.stock > 0 ? 'warning' : 'neutral'}>
                          {v.stock} in stock
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" className="!p-1.5" onClick={() => handleOpenEditVariant(v)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="!p-1.5 text-rose-600 hover:text-rose-700" onClick={() => v.id && handleDeleteVariant(v.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Generator Modal */}
      <Modal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        title="Auto-Generate Color & Size Variants Matrix"
      >
        <form onSubmit={handleGenerateVariants} className="space-y-4 text-xs">
          <Input
            label="Colors (comma separated)"
            value={selectedColorsText}
            onChange={(e) => setSelectedColorsText(e.target.value)}
            placeholder="Midnight Black, Ivory White, Rose Pink"
            required
          />

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Select Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE SIZE'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    selectedSizes.includes(sz)
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
            <Input
              label="MRP Price (₹)"
              type="number"
              value={baseMrp}
              onChange={(e) => setBaseMrp(e.target.value)}
              required
            />
            <Input
              label="Initial Stock / Qty"
              type="number"
              value={baseStock}
              onChange={(e) => setBaseStock(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setGeneratorModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isGenerating} size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Generate Matrix
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Single Variant Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Variant (${editForm.size} / ${editForm.color})`}
      >
        <form onSubmit={handleSaveVariant} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Variant SKU"
              value={editForm.sku}
              onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
              required
            />
            <Input
              label="Size"
              value={editForm.size}
              onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Color Name"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              required
            />
            <Input
              label="Color Hex Code"
              type="color"
              value={editForm.color_code}
              onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              required
            />
            <Input
              label="MRP (₹)"
              type="number"
              value={editForm.mrp}
              onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })}
              required
            />
            <Input
              label="Available Stock"
              type="number"
              value={editForm.stock}
              onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingVariant} size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Variant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
