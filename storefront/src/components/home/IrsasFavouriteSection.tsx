'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { collectionService } from '@/services/collectionService';
import { AddToCartButton } from '@/components/ui/AddToCartButton';

const fallbackFavourites = [
  {
    id: 1,
    name: 'Royal Kundan Choker Necklace Set',
    slug: 'royal-kundan-choker-necklace-set',
    price: 3499,
    mrp: 4999,
    tag: "IRSA'S PICK",
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Handcrafted Pearl Drop Jhumkas',
    slug: 'handcrafted-pearl-drop-jhumkas',
    price: 1599,
    mrp: 2299,
    tag: "MOST LOVED",
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Floral Gold-Plated Cuff Bracelet',
    slug: 'floral-gold-plated-cuff-bracelet',
    price: 1899,
    mrp: 2599,
    tag: "SIGNATURE",
    image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Anti-Tarnish Daily Gold Hoops',
    slug: 'anti-tarnish-daily-gold-hoops',
    price: 1299,
    mrp: 1799,
    tag: "EVERYDAY",
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Rose Gold Stacking Ring Set',
    slug: 'rose-gold-stacking-ring-set',
    price: 999,
    mrp: 1499,
    tag: "BESTSELLER",
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
];

export const IrsasFavouriteSection: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    collectionService
      .getCollectionBySlug('irsa-favourite')
      .then((res) => {
        if (res.success && res.data?.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        } else {
          setProducts(fallbackFavourites);
        }
      })
      .catch(() => {
        setProducts(fallbackFavourites);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 pt-4 pb-4">
      {/* Header Strip matching Shop By Collection Header Style */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 pr-4">
            <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 font-medium tracking-tight uppercase whitespace-nowrap">
              IRSA&apos;S FAVOURITE
            </h2>
            <div className="flex-1 flex items-center">
              <span className="h-px bg-[#DED6C7] w-full"></span>
              <span className="text-[#C59B58] text-xs pl-1">✦</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {/* Scroll Control Arrows */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-full border border-[#EFE6D8] bg-white hover:bg-[#FAF6F0] text-neutral-700 hover:text-[#B38548] transition-colors shadow-2xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-full border border-[#EFE6D8] bg-white hover:bg-[#FAF6F0] text-neutral-700 hover:text-[#B38548] transition-colors shadow-2xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <Link
              href="/collections/irsa-favourite"
              className="text-xs font-serif font-bold text-neutral-800 hover:text-[#B38548] flex items-center space-x-1 transition-colors uppercase shrink-0"
            >
              <span>Explore All</span>
              <span>→</span>
            </Link>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          HANDPICKED SIGNATURE EDIT — Personal jewellery pieces curated by Irsa Khan
        </p>
      </div>

      {/* Strict Single Horizontal Row Container with Arched Cards matching Shop By Collection */}
      <div
        ref={scrollContainerRef}
        className="flex flex-nowrap overflow-x-auto gap-3.5 sm:gap-5 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {products.map((item: any) => {
          const variant = item.variants?.[0];
          const price = item.price ?? (variant ? variant.price : 1499);
          const mrp = item.mrp ?? (variant ? variant.mrp : price * 1.3);
          const imgUrl =
            item.image ||
            item.images?.[0]?.image_url ||
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';
          const hoverImgUrl =
            item.hover_image ||
            item.images?.[1]?.image_url ||
            imgUrl;
          const productSlug = item.slug || 'jewellery-item';

          return (
            <Link
              key={item.id}
              href={`/product/${productSlug}`}
              className="group bg-[#F4EEE5] hover:bg-[#EFE7DA] border border-[#EBE3D7] rounded-t-[70px] sm:rounded-t-[90px] rounded-b-3xl p-2.5 pt-2.5 pb-3.5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md shrink-0 snap-start w-52 xs:w-60 sm:w-64 lg:w-[calc((100%-3.5rem)/4.5)]"
            >
              {/* Arched Top Full Card Product Image Container */}
              <div className="relative aspect-3/4 w-full bg-neutral-200 overflow-hidden rounded-t-[60px] sm:rounded-t-[80px] rounded-b-2xl mb-2.5">
                <Image
                  src={imgUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-105"
                />
                <Image
                  src={hoverImgUrl}
                  alt={`${item.name} - Hover View`}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <button
                  type="button"
                  className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white text-neutral-800 hover:text-[#B38548] rounded-full shadow-md hover:scale-110 transition-all z-20 border border-neutral-100 flex items-center justify-center"
                  title="Add to Wishlist"
                  aria-label="Add to Wishlist"
                >
                  <Heart className="w-4 h-4 stroke-[1.8]" />
                </button>
              </div>

              {/* Card Details Area */}
              <div className="px-1 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-serif text-xs sm:text-sm text-neutral-900 font-bold tracking-tight line-clamp-1 group-hover:text-[#B38548] transition-colors text-center">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-[#DED6C7]/60 gap-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5 leading-tight min-w-0">
                    <span className="font-sans font-bold text-xs sm:text-sm text-neutral-900">
                      ₹{Number(price).toLocaleString('en-IN')}
                    </span>
                    {mrp && mrp > price && (
                      <span className="font-sans text-[10px] sm:text-xs text-neutral-400 line-through">
                        ₹{Number(mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <AddToCartButton variantId={variant?.id || item.id} compact />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
