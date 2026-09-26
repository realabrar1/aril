'use client';

import React, { useEffect, useState } from 'react';
import { collectionService, Collection } from '@/services/collectionService';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { apiClient } from '@/services/apiClient';
import { mediaService } from '@/services/mediaService';
import { Product, Category } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Upload, Search, CheckSquare, Layers, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CollectionsPage() {
  const { showToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit/Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Manage Products Modal State
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [targetCollection, setTargetCollection] = useState<Collection | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await collectionService.getCollections();
      if (res.success && res.data) {
        setCollections(res.data);
      } else {
        setError(res.message || 'Failed to load collections.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading collections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
    categoryService.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  const handleOpenAddModal = () => {
    setEditingCollection(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setBannerUrl('');
    setSeoTitle('');
    setSeoDescription('');
    setStatus('ACTIVE');
    setSortOrder(collections.length + 1);
    setModalOpen(true);
  };

  const handleOpenEditModal = (col: Collection) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setImageUrl(col.image_url || '');
    setBannerUrl(col.banner_url || '');
    setSeoTitle(col.seo_title || '');
    setSeoDescription(col.seo_description || '');
    setStatus(col.status === 'DISABLED' ? 'DISABLED' : 'ACTIVE');
    setSortOrder(col.sort_order || 0);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCollection) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'image') setIsUploadingImage(true);
    else setIsUploadingBanner(true);

    try {
      const res = await mediaService.uploadImage(file, 'categories');
      if (res.success && res.data) {
        if (field === 'image') setImageUrl(res.data.url);
        else setBannerUrl(res.data.url);
        showToast('Image uploaded successfully.', 'success');
      }
    } catch {
      showToast('Image upload failed.', 'error');
    } finally {
      if (field === 'image') setIsUploadingImage(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Collection name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Collection> = {
        name,
        slug,
        description,
        image_url: imageUrl,
        banner_url: bannerUrl,
        seo_title: seoTitle,
        seo_description: seoDescription,
        status,
        sort_order: Number(sortOrder),
      };

      let res;
      if (editingCollection) {
        res = await collectionService.updateCollection(editingCollection.id, payload);
      } else {
        res = await collectionService.createCollection(payload);
      }

      if (res.success && res.data) {
        const savedCol = res.data;
        showToast(
          editingCollection
            ? `Collection "${name}" updated successfully.`
            : `Collection "${name}" created successfully. You can now assign products.`,
          'success'
        );
        setModalOpen(false);
        loadCollections();

        if (!editingCollection) {
          handleOpenManageProducts(savedCol);
        }
      } else {
        showToast(res.message || 'Unable to save collection.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving collection.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenManageProducts = async (col: Collection) => {
    setTargetCollection(col);
    setIsLoadingProducts(true);
    setManageModalOpen(true);
    setProductSearch('');
    setSelectedCategoryId('');

    try {
      // Fetch full collection details to get attached product IDs
      const colRes = await collectionService.getCollection(col.id);
      if (colRes.success && colRes.data && colRes.data.products) {
        setSelectedProductIds(colRes.data.products.map((p) => p.id));
      } else {
        setSelectedProductIds([]);
      }

      // Fetch all products for selector
      const prodRes = await apiClient<Product[]>('/admin/products?per_page=500');
      if (prodRes.success && prodRes.data) {
        setAllProducts(prodRes.data);
      }
    } catch {
      showToast('Failed to load products for collection.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleToggleProduct = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (!targetCollection) return;
    setIsSyncingProducts(true);
    try {
      const res = await collectionService.syncProducts(targetCollection.id, selectedProductIds);
      if (res.success) {
        showToast(`Products assigned to "${targetCollection.name}" updated successfully.`, 'success');
        setManageModalOpen(false);
        loadCollections();
      } else {
        showToast(res.message || 'Failed to update collection products.', 'error');
      }
    } catch {
      showToast('Error syncing products.', 'error');
    } finally {
      setIsSyncingProducts(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await collectionService.deleteCollection(collectionToDelete.id);
      if (res.success) {
        showToast(`Collection "${collectionToDelete.name}" deleted.`, 'success');
        setDeleteModalOpen(false);
        loadCollections();
      } else {
        showToast(res.message || 'Unable to delete collection.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting collection.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      !selectedCategoryId || String(p.category_id) === String(selectedCategoryId);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Collections Management</h1>
          <p className="text-xs text-neutral-500">
            Create, edit, and organize curated jewellery collections & marketing campaign edits
          </p>
        </div>
        <Button onClick={handleOpenAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Collection
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="!p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search collections by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 !py-1.5 text-xs"
          />
        </div>
      </Card>

      {/* Collections Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadCollections} />
      ) : filteredCollections.length === 0 ? (
        <Card className="!p-8 text-center space-y-3">
          <Layers className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-sm font-bold text-neutral-700">No collections found</p>
          <p className="text-xs text-neutral-400">Click &quot;Create Collection&quot; to build your first collection.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 border-b border-neutral-200 uppercase text-[10px] font-black text-neutral-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      {col.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                          <Image src={col.image_url} alt={col.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-[10px]">
                          NO IMG
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-neutral-900 text-sm">{col.name}</div>
                      {col.description && (
                        <div className="text-[11px] text-neutral-400 truncate max-w-xs">{col.description}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                      /collections/{col.slug}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                        {col.products_count ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-neutral-700">
                      {col.sort_order}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant={col.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {col.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenManageProducts(col)}
                          leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                          className="!py-1 !px-2.5 text-[11px]"
                        >
                          Manage Products
                        </Button>

                        <a
                          href={`http://localhost:3000/collections/${col.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-black rounded hover:bg-neutral-100 transition-colors"
                          title="View on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(col)}
                          className="!p-1.5 text-neutral-600 hover:text-black"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCollectionToDelete(col);
                            setDeleteModalOpen(true);
                          }}
                          className="!p-1.5 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit / Create Collection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Create New Collection'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Collection Name *"
              placeholder="e.g. Earrings or Diwali Edit"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />

            <Input
              label="URL Slug *"
              placeholder="earrings or diwali"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Collection Description"
            placeholder="Brief overview displayed on top of collection detail page..."
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Images Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card Thumbnail Image */}
            <div className="space-y-1.5 border border-neutral-200 p-3 rounded-xl bg-neutral-50/50">
              <label className="font-bold text-neutral-700 block">Collection Image (Card Thumbnail)</label>
              {imageUrl && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-neutral-200 shrink-0 mb-2">
                  <Image src={imageUrl} alt="Thumbnail Preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="!py-1 text-xs flex-1"
                />
                <label className="cursor-pointer px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-bold flex items-center space-x-1 shrink-0 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingImage ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Banner Cover Image */}
            <div className="space-y-1.5 border border-neutral-200 p-3 rounded-xl bg-neutral-50/50">
              <label className="font-bold text-neutral-700 block">Banner Cover Image (Page Header)</label>
              {bannerUrl && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-neutral-200 shrink-0 mb-2">
                  <Image src={bannerUrl} alt="Banner Preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="https://..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="!py-1 text-xs flex-1"
                />
                <label className="cursor-pointer px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-bold flex items-center space-x-1 shrink-0 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingBanner ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SEO Metadata Section */}
          <div className="p-3 border border-neutral-200 rounded-xl space-y-3 bg-neutral-50/30">
            <h3 className="font-extrabold text-neutral-900 text-xs tracking-tight">SEO Metadata & OpenGraph</h3>

            <Input
              label="SEO Title"
              placeholder="e.g. Earrings | Anti-Tarnish & Gold Plated Jewellery | Arilha"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />

            <Textarea
              label="SEO Description"
              placeholder="Meta description for search engines..."
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              options={[
                { value: 'ACTIVE', label: 'Active (Visible on Storefront)' },
                { value: 'DISABLED', label: 'Disabled (Hidden)' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE')}
            />

            <Input
              label="Display Sort Order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} size="sm">
              Save Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Products Checklist Modal */}
      <Modal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={`Manage Products — ${targetCollection?.name}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-neutral-500">
            Check products to include in this collection. A single product can belong to multiple collections.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search products by name or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9 !py-1.5"
              />
            </div>

            <Select
              options={[
                { label: 'All Categories', value: '' },
                ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
              ]}
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="!py-1.5 text-xs font-semibold"
            />
          </div>

          {isLoadingProducts ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 border border-neutral-200 rounded-xl p-2 bg-neutral-50/50 divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const primaryImage = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url;

                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/80 border border-amber-200' : 'hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleProduct(p.id)}
                        className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />

                      {primaryImage ? (
                        <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0">
                          <Image src={primaryImage} alt={p.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-neutral-200 shrink-0" />
                      )}

                      <div>
                        <div className="font-bold text-neutral-900">{p.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400">SKU: {p.sku}</div>
                      </div>
                    </div>

                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>{p.status}</Badge>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <span className="text-xs font-extrabold text-neutral-700">
              Selected: {selectedProductIds.length} Products
            </span>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => setManageModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button size="sm" isLoading={isSyncingProducts} onClick={handleSaveProducts}>
                Save Products
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Collection?"
        message={`Are you sure you want to delete "${collectionToDelete?.name}"? Products inside this collection will not be deleted.`}
        confirmText="Delete Collection"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
}
