'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { cartService } from '@/services/cartService';

interface AddToCartButtonProps {
  variantId?: number;
  productId?: number;
  className?: string;
  buttonText?: string;
  compact?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  variantId,
  productId,
  className = '',
  buttonText = 'ADD TO CART',
  compact = false,
}) => {
  const targetVariantId = variantId || productId || 1;

  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const [cartItemId, setCartItemId] = useState<number | null>(null);

  const syncStateFromCache = () => {
    const cached = cartService.getCachedCart();
    if (cached && cached.items) {
      const item = cached.items.find(
        (i) => i.variant_id === targetVariantId || i.product_id === targetVariantId
      );
      if (item) {
        setCartQuantity(item.quantity);
        setCartItemId(item.cart_item_id);
        return true;
      }
    }
    return false;
  };

  const syncCartState = async () => {
    const foundInCache = syncStateFromCache();
    if (!foundInCache) {
      try {
        const res = await cartService.getCart();
        if (res.success && res.data && res.data.items) {
          const item = res.data.items.find(
            (i) => i.variant_id === targetVariantId || i.product_id === targetVariantId
          );
          if (item) {
            setCartQuantity(item.quantity);
            setCartItemId(item.cart_item_id);
          } else {
            setCartQuantity(0);
            setCartItemId(null);
          }
        }
      } catch {
        // Ignore
      }
    }
  };

  useEffect(() => {
    syncCartState();

    window.addEventListener('arilha-cart-updated', syncCartState);
    window.addEventListener('femmeera-cart-updated', syncCartState);
    return () => {
      window.removeEventListener('arilha-cart-updated', syncCartState);
      window.removeEventListener('femmeera-cart-updated', syncCartState);
    };
  }, [targetVariantId]);

  const dispatchCartEvent = () => {
    window.dispatchEvent(new Event('arilha-cart-updated'));
    window.dispatchEvent(new Event('femmeera-cart-updated'));
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousQty = cartQuantity;
    const previousItemId = cartItemId;
    const nextQty = previousQty + 1;

    // 1. Instant Optimistic UI Update (0ms delay)
    setCartQuantity(nextQty);

    try {
      if (previousQty > 0 && previousItemId) {
        const res = await cartService.updateQuantity(previousItemId, nextQty);
        if (res.success) {
          dispatchCartEvent();
        } else {
          setCartQuantity(previousQty);
        }
      } else {
        const res = await cartService.addItem(targetVariantId, 1);
        if (res.success && res.data) {
          const item = res.data.items?.find(
            (i) => i.variant_id === targetVariantId || i.product_id === targetVariantId
          );
          if (item) setCartItemId(item.cart_item_id);
          dispatchCartEvent();
        } else {
          setCartQuantity(previousQty);
        }
      }
    } catch {
      // Revert on network failure
      setCartQuantity(previousQty);
      setCartItemId(previousItemId);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartQuantity <= 0) return;

    const previousQty = cartQuantity;
    const previousItemId = cartItemId;
    const nextQty = previousQty - 1;

    // 1. Instant Optimistic UI Update (0ms delay)
    setCartQuantity(nextQty);
    if (nextQty === 0) setCartItemId(null);

    try {
      if (previousQty === 1 && previousItemId) {
        const res = await cartService.removeItem(previousItemId);
        if (res.success) {
          dispatchCartEvent();
        } else {
          setCartQuantity(previousQty);
          setCartItemId(previousItemId);
        }
      } else if (previousQty > 1 && previousItemId) {
        const res = await cartService.updateQuantity(previousItemId, nextQty);
        if (res.success) {
          dispatchCartEvent();
        } else {
          setCartQuantity(previousQty);
        }
      }
    } catch {
      // Revert on network failure
      setCartQuantity(previousQty);
      setCartItemId(previousItemId);
    }
  };

  if (cartQuantity > 0) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`inline-flex items-center justify-between rounded-xl font-sans font-bold bg-[#B38548] text-white shadow-2xs overflow-hidden transition-all ${
          compact ? 'h-7 px-1.5 min-w-[75px] text-[10px]' : 'h-9 px-2 min-w-[95px] text-xs'
        } ${className}`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          className="w-5 h-full flex items-center justify-center hover:bg-black/20 rounded transition-colors text-white font-bold active:scale-90"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="px-1 text-center font-bold tracking-wider text-white select-none">
          {cartQuantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          className="w-5 h-full flex items-center justify-center hover:bg-black/20 rounded transition-colors text-white font-bold active:scale-90"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleIncrement}
      className={`rounded-xl font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 bg-[#B38548] hover:bg-[#966C32] text-white active:scale-95 shadow-2xs ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-2 text-[11px]'
      } ${className}`}
    >
      <ShoppingBag className="w-3.5 h-3.5 hidden sm:inline-block" />
      <span>{buttonText}</span>
    </button>
  );
};
