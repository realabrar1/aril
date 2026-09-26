'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Upload,
  X,
  UserCheck
} from 'lucide-react';
import {
  productService,
  ProductReviewsData,
  ReviewEligibilityData,
  ProductReviewItem
} from '@/services/productService';

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const [reviewsData, setReviewsData] = useState<ProductReviewsData | null>(null);
  const [eligibility, setEligibility] = useState<ReviewEligibilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (productId) {
      loadReviews();
      checkEligibility();
    }
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProductReviews(productId);
      if (res.success && res.data) {
        setReviewsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load product reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const res = await productService.checkReviewEligibility(productId);
      if (res.success && res.data) {
        setEligibility(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 3) {
      setToastMessage({ type: 'error', text: 'Please enter a review comment.' });
      return;
    }

    setSubmitting(true);
    setToastMessage(null);

    try {
      const formData = new FormData();
      formData.append('product_id', productId.toString());
      formData.append('rating', rating.toString());
      formData.append('title', title || 'Verified Customer Review');
      formData.append('comment', comment.trim());

      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('images[]', selectedFiles[i]);
        }
      }

      const res = await productService.submitProductReview(formData);
      if (res.success) {
        setToastMessage({ type: 'success', text: 'Thank you! Your verified review has been published.' });
        setIsModalOpen(false);
        setTitle('');
        setComment('');
        setSelectedFiles(null);
        setRating(5);
        loadReviews();
        checkEligibility();
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Failed to submit review.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: 'An unexpected error occurred while submitting review.' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = reviewsData?.total_reviews || 0;
  const avgRating = reviewsData?.average_rating || 0;
  const breakdown = reviewsData?.rating_breakdown || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };

  if (isLoading || !reviewsData || totalReviews === 0 || reviewsData.reviews.length === 0) {
    return null;
  }

  return (
    <div id="reviews-section" className="border-t border-[#EFE6D8] pt-10 space-y-8 font-sans text-neutral-900 scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#EFE6D8] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B38548] block">
            VERIFIED CUSTOMER FEEDBACK
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-neutral-900">
            Ratings &amp; Reviews
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Real reviews from customers who purchased {productName}
          </p>
        </div>

        {/* Action Button Area */}
        <div className="shrink-0">
          {eligibility?.can_review ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-[#B38548] hover:bg-[#966C32] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          ) : eligibility?.already_reviewed ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You have reviewed this product</span>
            </div>
          ) : eligibility?.reason === 'UNAUTHENTICATED' ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DEC8] hover:border-[#B38548] text-neutral-800 text-xs font-bold rounded-xl transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#B38548]" />
              <span>Log in to review your purchase</span>
            </Link>
          ) : (
            <div className="px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] text-neutral-600 text-xs font-medium rounded-xl">
              <span>🔒 Only verified buyers who purchased this item can leave a review</span>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          toastMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Ratings Breakdown Grid */}
      <div className="bg-white border border-[#EFE6D8] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xs">
        
        {/* Rating Score */}
        <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-neutral-100 pb-6 md:pb-0 md:pr-8 space-y-2">
          <div className="font-serif text-5xl font-medium text-neutral-900 leading-none">
            {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
          </div>
          <div className="flex justify-center md:justify-start text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'fill-current' : 'text-neutral-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Progress Bars */}
        <div className="md:col-span-8 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = (breakdown as any)[starNum.toString()] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={starNum} className="flex items-center gap-3">
                <span className="w-12 font-bold text-neutral-700 flex items-center gap-1 shrink-0">
                  {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-medium text-neutral-500 text-[11px] shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Individual Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-[#EFE6D8]">
            <RefreshCw className="w-6 h-6 text-[#B38548] animate-spin" />
          </div>
        ) : !reviewsData || reviewsData.reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#EFE6D8] p-8 space-y-3">
            <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-serif text-lg font-medium text-neutral-800">No Reviews Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Be the first verified buyer to leave a review for {productName}!
            </p>
          </div>
        ) : (
          reviewsData.reviews.map((rev: ProductReviewItem) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-[#EFE6D8] shadow-2xs space-y-3 transition-shadow hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-medium text-sm text-neutral-900">
                      {rev.reviewer_name}
                    </span>

                    {rev.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>

                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-current' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <span className="text-[11px] text-neutral-400">
                  {new Date(rev.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {rev.title && (
                <h4 className="font-semibold text-xs text-neutral-900">
                  {rev.title}
                </h4>
              )}

              <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                {rev.comment}
              </p>

              {/* Review Uploaded Photos */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2.5 pt-2">
                  {rev.images.map((imgUrl, imgIdx) => (
                    <a
                      key={imgIdx}
                      href={imgUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E8DEC8] bg-neutral-50 block hover:opacity-95 transition-opacity"
                    >
                      <Image src={imgUrl} alt={`Review photo ${imgIdx + 1}`} fill className="object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* WRITE A REVIEW MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DEC8] my-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#B38548] uppercase tracking-wider block">
                VERIFIED REVIEW
              </span>
              <h3 className="font-serif text-xl font-medium text-neutral-900">
                Review {productName}
              </h3>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Interactive Input */}
              <div className="space-y-1.5 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DEC8] text-center">
                <label className="font-bold text-neutral-800 block text-xs">
                  Overall Rating *
                </label>
                <div className="flex justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-hidden transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-[#B38548]">
                  {rating === 5 && 'Outstanding! Highly Recommended'}
                  {rating === 4 && 'Good product & quality'}
                  {rating === 3 && 'Average experience'}
                  {rating === 2 && 'Below expectations'}
                  {rating === 1 && 'Poor quality'}
                </span>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Headline / Summary (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stunning finish and daily durability!"
                  className="w-full px-4 py-2.5 bg-white border border-[#E8DEC8] rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Your Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your genuine feedback about comfort, finish, packaging, and styling..."
                  className="w-full px-4 py-2.5 bg-white border border-[#E8DEC8] rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Upload Product Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-[#E8DEC8] hover:border-[#B38548] rounded-xl p-4 text-center cursor-pointer bg-neutral-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#B38548] file:text-white hover:file:bg-[#966C32] cursor-pointer"
                  />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <p className="text-[11px] font-bold text-emerald-700 mt-2">
                      ✓ {selectedFiles.length} {selectedFiles.length === 1 ? 'photo' : 'photos'} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <span className="text-[10px] text-neutral-400">
                  Verified Buyer Review System
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#B38548] hover:bg-[#966C32] disabled:opacity-50 text-white font-bold rounded-xl flex items-center space-x-2"
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Review</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
