'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import { wishlistService } from '@/services/wishlistService';
import { analytics } from '@/lib/analytics';
import { AddToCartButton } from '@/components/ui/AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    wishlistService.isInWishlist(product.id)
  );

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = wishlistService.toggleWishlist(product);
    setIsWishlisted(result.isWishlisted);
    if (result.isWishlisted) {
      analytics.track('WISHLIST_ADD', { product_id: product.id, product_name: product.name });
    }
  };

  // Find lowest price & highest mrp among variants
  const variants = product.variants || [];
  const firstVariant = variants[0];
  const primaryPrice = product.price || (variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 1499);
  const primaryMrp = product.mrp || (variants.length > 0 ? Math.max(...variants.map((v) => v.mrp)) : 1999);
  const discountPercent = primaryMrp > primaryPrice ? Math.round(((primaryMrp - primaryPrice) / primaryMrp) * 100) : 0;

  return (
    <div className="group relative bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Box */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-3/4 bg-neutral-100 overflow-hidden">
        {/* Primary & Secondary Hover Image */}
        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 font-bold text-xs relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0].image_url}
                alt={`${product.name} - ${product.category?.name || 'Jewellery'} by ${product.brand || 'ARILHA'}`}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  product.images.length > 1 ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-110'
                }`}
              />
              {product.images.length > 1 && (
                <img
                  src={product.images[1].image_url}
                  alt={`${product.name} - Alternate View`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
              )}
            </>
          ) : (
            <span className="uppercase tracking-widest text-[11px] text-neutral-400 font-mono">{product.brand || 'ARILHA'}</span>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1">
          {product.is_new && (
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              NEW
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-md rounded-full text-neutral-700 hover:text-rose-600 transition-colors shadow-sm z-10"
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </Link>

      {/* Product Details Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
            {product.category?.name || product.brand || 'WOMEN'}
          </span>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart Row */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 gap-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5 leading-tight">
            <span className="text-sm sm:text-base font-black text-neutral-900">
              ₹{Number(primaryPrice || 0).toLocaleString('en-IN')}
            </span>
            {primaryMrp > primaryPrice && (
              <span className="text-[10px] sm:text-[11px] text-neutral-400 line-through">
                ₹{Number(primaryMrp || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <AddToCartButton variantId={firstVariant?.id || product.id} compact />
        </div>
      </div>
    </div>
  );
};
