'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { reviewService, ReviewItem } from '@/services/reviewService';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import {
  Star,
  Check,
  X,
  Trash2,
  RefreshCw,
  MessageSquare,
  Plus,
  ShieldCheck,
  Edit,
  Upload,
  Search,
  Filter
} from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);

  // Add Form State
  const [addForm, setAddForm] = useState({
    product_id: '',
    reviewer_name: '',
    rating: 5,
    title: '',
    comment: '',
    status: 'APPROVED',
    is_verified_purchase: true,
  });
  const [addImages, setAddImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    reviewer_name: '',
    rating: 5,
    title: '',
    comment: '',
    status: 'APPROVED',
    is_verified_purchase: true,
  });

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, [statusFilter]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await reviewService.getReviews(1, statusFilter, searchQuery);
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productService.getProducts(1);
      if (res.success && res.data) {
        setProductsList(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const handleStatusChange = async (id: number, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      await reviewService.updateStatus(id, status);
      loadReviews();
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review? File photos will also be permanently removed.')) return;
    try {
      await reviewService.deleteReview(id);
      loadReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.product_id || !addForm.reviewer_name || !addForm.comment) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product_id', addForm.product_id);
      formData.append('reviewer_name', addForm.reviewer_name);
      formData.append('rating', addForm.rating.toString());
      formData.append('title', addForm.title || 'Verified Customer Review');
      formData.append('comment', addForm.comment);
      formData.append('status', addForm.status);
      formData.append('is_verified_purchase', addForm.is_verified_purchase ? '1' : '0');

      if (addImages) {
        for (let i = 0; i < addImages.length; i++) {
          formData.append('images[]', addImages[i]);
        }
      }

      const res = await reviewService.createReview(formData);
      if (res.success) {
        alert('Review added successfully!');
        setIsAddModalOpen(false);
        setAddForm({
          product_id: '',
          reviewer_name: '',
          rating: 5,
          title: '',
          comment: '',
          status: 'APPROVED',
          is_verified_purchase: true,
        });
        setAddImages(null);
        loadReviews();
      } else {
        alert(res.message || 'Failed to create review');
      }
    } catch (err) {
      alert('An error occurred creating review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (rev: ReviewItem) => {
    setSelectedReview(rev);
    setEditForm({
      reviewer_name: rev.reviewer_name || rev.user_name || 'Customer',
      rating: rev.rating,
      title: rev.title || '',
      comment: rev.comment || '',
      status: rev.status,
      is_verified_purchase: rev.is_verified_purchase ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    setIsSubmitting(true);
    try {
      const res = await reviewService.updateReview(selectedReview.id, {
        reviewer_name: editForm.reviewer_name,
        rating: editForm.rating,
        title: editForm.title,
        comment: editForm.comment,
        status: editForm.status as any,
        is_verified_purchase: editForm.is_verified_purchase,
      });

      if (res.success) {
        alert('Review updated successfully!');
        setIsEditModalOpen(false);
        setSelectedReview(null);
        loadReviews();
      } else {
        alert(res.message || 'Failed to update review.');
      }
    } catch {
      alert('Failed to update review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-neutral-900">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Customer Reviews &amp; Moderation</h1>
          <p className="text-xs text-neutral-500">Manage, moderate, and add customer reviews for Arilha products</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin Review</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="text-xs font-bold text-neutral-700">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#B38548]"
          >
            <option value="">All Reviews</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviewer or product..."
            className="w-full pl-9 pr-4 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#B38548]"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Reviews Table / List Card */}
      <Card title="Product Reviews">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#B38548] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-50 rounded-xl border border-neutral-200">
            <MessageSquare className="w-10 h-10 text-neutral-400 mb-3" />
            <h3 className="text-sm font-bold text-neutral-900">No Reviews Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Customer reviews will appear here for moderation once submitted.
            </p>
          </div>
        ) : (
          <div className="p-4 divide-y divide-neutral-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  
                  {/* Rating Stars & Badges */}
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-current' : 'text-neutral-300'}`}
                        />
                      ))}
                    </div>

                    <span className="text-xs font-bold text-neutral-900">{rev.title || 'Product Review'}</span>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rev.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rev.status}
                    </span>

                    {rev.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>

                  {/* Review Photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {rev.images.map((img) => (
                        <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer" className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 block">
                          <Image src={img.image_url} alt="Review attachment" fill className="object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Metadata info */}
                  <div className="flex items-center space-x-4 text-[11px] text-neutral-500 pt-1">
                    <span>Product: <strong className="text-neutral-900">{rev.product_name || `Product #${rev.product_id}`}</strong></span>
                    <span>Reviewer: <strong className="text-neutral-900">{rev.reviewer_name || rev.user_name || 'Customer'}</strong></span>
                    <span>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {rev.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs rounded-lg flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                    title="Edit Review"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CREATE REVIEW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-neutral-900">Add Admin Product Review</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Select Product *</label>
                <select
                  required
                  value={addForm.product_id}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, product_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                >
                  <option value="">-- Choose Product --</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku || p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Reviewer Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.reviewer_name}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, reviewer_name: e.target.value }))}
                  placeholder="e.g. Pooja S. or Verified Buyer"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Rating (1–5 Stars) *</label>
                  <select
                    value={addForm.rating}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                  >
                    <option value="APPROVED">Approved (Visible)</option>
                    <option value="PENDING">Pending Moderation</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Review Title</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Beautiful finish & supreme quality!"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Review Comment *</label>
                <textarea
                  required
                  rows={4}
                  value={addForm.comment}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Write customer feedback text..."
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="verified_check"
                  checked={addForm.is_verified_purchase}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, is_verified_purchase: e.target.checked }))}
                  className="rounded border-neutral-300 text-[#B38548] focus:ring-[#B38548]"
                />
                <label htmlFor="verified_check" className="font-semibold text-neutral-800">
                  Mark as &quot;Verified Purchase&quot;
                </label>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Upload Review Photos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setAddImages(e.target.files)}
                  className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#B38548] hover:bg-[#966C32] disabled:opacity-50 text-white font-bold rounded-xl flex items-center space-x-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {isEditModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-neutral-900">Edit Product Review #{selectedReview.id}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={editForm.reviewer_name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, reviewer_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Rating</label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                  >
                    <option value="APPROVED">Approved (Visible)</option>
                    <option value="PENDING">Pending Moderation</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={editForm.comment}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="edit_verified_check"
                  checked={editForm.is_verified_purchase}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, is_verified_purchase: e.target.checked }))}
                  className="rounded border-neutral-300 text-[#B38548] focus:ring-[#B38548]"
                />
                <label htmlFor="edit_verified_check" className="font-semibold text-neutral-800">
                  Verified Purchase Badge
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#B38548] hover:bg-[#966C32] disabled:opacity-50 text-white font-bold rounded-xl flex items-center space-x-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
