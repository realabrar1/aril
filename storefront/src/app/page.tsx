import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Heart, CheckCircle2, ShieldCheck, Truck, RotateCcw, CreditCard, Award, Sparkles } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { collectionService } from '@/services/collectionService';
import { productService } from '@/services/productService';
import { cmsService } from '@/services/cmsService';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PromoPopupModal } from '@/components/home/PromoPopupModal';
import { WatchAndShopSection } from '@/components/home/WatchAndShopSection';
import { IrsasFavouriteSection } from '@/components/home/IrsasFavouriteSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { LifestyleCarousel } from '@/components/home/LifestyleCarousel';
import { AddToCartButton } from '@/components/ui/AddToCartButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultNewArrivals = [
  {
    id: 101,
    name: 'Floral Gold-Plated Cuff Bracelet',
    slug: 'floral-gold-plated-cuff-bracelet',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 102,
    name: 'Royal Kundan Choker Necklace Set',
    slug: 'royal-kundan-choker-necklace-set',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 103,
    name: 'Anti-Tarnish Daily Gold Hoops',
    slug: 'anti-tarnish-daily-gold-hoops',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 104,
    name: 'Handcrafted Pearl Drop Jhumkas',
    slug: 'handcrafted-pearl-drop-jhumkas',
    price: 1599,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 105,
    name: 'Rose Gold Stacking Ring Set',
    slug: 'rose-gold-stacking-ring-set',
    price: 999,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 106,
    name: 'Minimalist Layered Gold Chain',
    slug: 'minimalist-layered-gold-chain',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
];

const defaultTraditionalWear = [
  {
    id: 102,
    name: 'Royal Kundan Choker Necklace Set',
    slug: 'royal-kundan-choker-necklace-set',
    price: 3499,
    mrp: 4999,
    tag: 'KUNDAN',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 104,
    name: 'Handcrafted Pearl Drop Jhumkas',
    slug: 'handcrafted-pearl-drop-jhumkas',
    price: 1599,
    mrp: 2299,
    tag: 'BRIDAL',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 107,
    name: 'Heritage Meenakari Bangle Set',
    slug: 'heritage-meenakari-bangle-set',
    price: 2199,
    mrp: 2999,
    tag: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 108,
    name: 'Embellished Statement Pendant Set',
    slug: 'embellished-statement-pendant-set',
    price: 2799,
    mrp: 3799,
    tag: 'ROYAL EDIT',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 109,
    name: 'Kundan Chandbali Earrings',
    slug: 'kundan-chandbali-earrings',
    price: 1799,
    mrp: 2499,
    tag: 'KUNDAN',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 110,
    name: 'Royal Antique Bridal Haathphool',
    slug: 'royal-antique-bridal-haathphool',
    price: 3199,
    mrp: 4299,
    tag: 'BRIDAL',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
];

const defaultWesternWear = [
  {
    id: 103,
    name: 'Anti-Tarnish Daily Gold Hoops',
    slug: 'anti-tarnish-daily-gold-hoops',
    price: 1299,
    mrp: 1799,
    tag: 'ANTI-TARNISH',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 105,
    name: 'Rose Gold Stacking Ring Set',
    slug: 'rose-gold-stacking-ring-set',
    price: 999,
    mrp: 1499,
    tag: 'EVERYDAY',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 106,
    name: 'Minimalist Layered Gold Chain',
    slug: 'minimalist-layered-gold-chain',
    price: 1499,
    mrp: 1999,
    tag: 'GOLD-PLATED',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 111,
    name: 'Waterproof Anti-Tarnish Coin Pendant',
    slug: 'waterproof-anti-tarnish-coin-pendant',
    price: 1399,
    mrp: 1899,
    tag: 'ANTI-TARNISH',
    image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 112,
    name: 'Chic Everyday Gold Tennis Bracelet',
    slug: 'chic-everyday-gold-tennis-bracelet',
    price: 1699,
    mrp: 2299,
    tag: 'EVERYDAY',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 113,
    name: 'Sleek Solitaire Crystal Band Ring',
    slug: 'sleek-solitaire-crystal-band-ring',
    price: 1199,
    mrp: 1599,
    tag: 'SIGNATURE',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    hover_image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop',
  },
];

export default async function HomePage() {
  const [categoriesRes, collectionsRes, productsRes, traditionalRes, westernRes, settingsRes] = await Promise.all([
    categoryService.getCategories().catch(() => ({ success: false, data: [] })),
    collectionService.getCollections().catch(() => ({ success: false, data: [] })),
    productService.getProducts({ page: 1 }).catch(() => ({ success: false, data: [] })),
    productService.getProducts({ category_slug: 'kundan-festive' }).catch(() => ({ success: false, data: [] })),
    productService.getProducts({ category_slug: 'everyday-jewellery' }).catch(() => ({ success: false, data: [] })),
    cmsService.getSettings().catch(() => ({ success: false, data: {} })),
  ]);

  const settings: Record<string, any> = settingsRes.data || {};
  const promoImage = settings.promo_banner_image || '/images/unlock_world_fashion_banner.jpg';
  const promoUrl = settings.promo_banner_url || '/shop';
  const promoStatus = settings.promo_banner_status || 'ACTIVE';
  const promoFit = settings.promo_banner_fit || 'cover';

  const rawProducts = productsRes.data || [];
  const displayNewArrivals = rawProducts.length > 0 ? rawProducts.slice(0, 6) : defaultNewArrivals;

  const rawTraditional = traditionalRes.data || [];
  const displayTraditional = rawTraditional.length > 0 ? rawTraditional.slice(0, 6) : defaultTraditionalWear;

  const rawWestern = westernRes.data || [];
  const displayWestern = rawWestern.length > 0 ? rawWestern.slice(0, 6) : defaultWesternWear;

  const defaultCollections = [
    { name: 'Earrings', subtitle: 'Statement & Drop Earrings', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop', slug: 'earrings' },
    { name: 'Chains', subtitle: 'Mini & Layered Chains', image_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop', slug: 'chains' },
    { name: 'Rings', subtitle: 'Statement & Stacking Rings', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop', slug: 'rings' },
    { name: 'Bracelets', subtitle: 'Sleek & Charm Bracelets', image_url: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop', slug: 'bracelets' },
    { name: 'Necklaces', subtitle: 'Kundan & Bridal Necklaces', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop', slug: 'necklaces' },
    { name: 'Watches', subtitle: 'Timeless Luxury Watches', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop', slug: 'watches' },
  ];

  const targetSlugs = ['earrings', 'chains', 'rings', 'bracelets', 'necklaces', 'watches'];
  let shopCollections = defaultCollections;

  if (collectionsRes.success && Array.isArray(collectionsRes.data) && collectionsRes.data.length > 0) {
    const fetched = collectionsRes.data;
    const ordered = targetSlugs.map((slug) => {
      const found = fetched.find((c: any) => c.slug === slug || c.name.toLowerCase() === slug);
      return found || defaultCollections.find((d) => d.slug === slug);
    }).filter(Boolean);

    if (ordered.length > 0) {
      shopCollections = ordered as any[];
    }
  }

  const defaultFeaturedCollections = [
    {
      title: 'GOLD-PLATED JEWELLERY',
      subtitle: 'Handcrafted Necklaces, Earrings & Cuffs',
      image: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=800&auto=format&fit=crop',
      link: '/collections/earrings',
    },
    {
      title: 'ANTI-TARNISH EVERYDAY',
      subtitle: 'Sleek Hoops, Rings & Layered Chains',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
      link: '/collections/chains',
    },
    {
      title: 'ROYAL KUNDAN & BRIDAL',
      subtitle: 'Heritage Chokers & Bridal Sets',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      link: '/collections/diwali',
    },
    {
      title: 'EXCLUSIVE 999 EDIT',
      subtitle: 'Premium Luxury Jewellery Under ₹999',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
      link: '/collections/exclusive-999',
    },
  ];

  const featuredCollections = Array.isArray(settings.homepage_featured_collections) && settings.homepage_featured_collections.length > 0
    ? settings.homepage_featured_collections
    : defaultFeaturedCollections;

  return (
    <div className="space-y-8 sm:space-y-16 pb-16">
      <PromoPopupModal />
      
      {/* 1. HERO SLIDER */}
      <HeroSlider />

      {/* 2. SHOP BY COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 -mt-8 sm:-mt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 pr-4">
            <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 font-medium tracking-tight uppercase whitespace-nowrap">
              SHOP BY COLLECTION
            </h2>
            <div className="flex-1 flex items-center">
              <span className="h-px bg-[#DED6C7] w-full"></span>
              <span className="text-[#C59B58] text-xs pl-1">✦</span>
            </div>
          </div>
          <Link
            href="/collections"
            className="text-xs font-serif font-bold text-neutral-800 hover:text-[#B38548] flex items-center space-x-1 shrink-0 transition-colors"
          >
            <span>Explore All</span>
            <span>→</span>
          </Link>
        </div>

        <div className="flex flex-nowrap overflow-x-auto sm:grid sm:grid-cols-6 gap-2 sm:gap-4 pb-2 no-scrollbar scroll-smooth">
          {shopCollections.map((col: any, idx: number) => {
            const imgSrc = col.image_url || col.image || 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop';
            const sub = col.description || col.subtitle || 'Explore collection';

            return (
              <Link
                key={col.slug || idx}
                href={`/collections/${col.slug}`}
                className="group bg-[#F4EEE5] hover:bg-[#EFE7DA] rounded-t-full rounded-b-3xl p-1.5 pt-2 pb-3 sm:p-4 sm:pt-4 sm:pb-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xs flex-none w-[calc((100%-1.75rem)/4.5)] sm:w-auto"
              >
                <div className="relative w-[58px] h-[58px] xs:w-[66px] xs:h-[66px] sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0 bg-neutral-200">
                  <Image
                    src={imgSrc}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-sans font-bold text-[10px] xs:text-[11px] sm:text-sm uppercase tracking-tight sm:tracking-wider text-neutral-900 group-hover:text-[#B38548] transition-colors mt-2 sm:mt-3.5 line-clamp-1">
                  {col.name}
                </h3>
                <p className="hidden sm:block text-xs text-neutral-800 mt-1 line-clamp-2 leading-snug px-0.5 font-normal">
                  {sub}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 pt-0 sm:pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 pr-4">
            <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 font-medium tracking-tight uppercase whitespace-nowrap">
              NEW ARRIVALS
            </h2>
            <div className="flex-1 flex items-center">
              <span className="h-px bg-[#DED6C7] w-full"></span>
              <span className="text-[#C59B58] text-xs pl-1">✦</span>
            </div>
          </div>
          <Link
            href="/shop"
            className="text-xs font-serif font-bold text-neutral-800 hover:text-[#B38548] flex items-center space-x-1 shrink-0 transition-colors uppercase"
          >
            <span>VIEW ALL</span>
            <span>→</span>
          </Link>
        </div>
        <p className="text-xs text-neutral-500 -mt-3">Freshly launched jewellery designs &amp; anti-tarnish edits</p>

        <div className="flex flex-nowrap overflow-x-auto gap-3.5 sm:gap-5 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {displayNewArrivals.map((item: any) => {
            const variant = item.variants?.[0];
            const price = item.price ?? (variant ? variant.price : 1499);
            const mrp = item.mrp ?? (variant ? variant.mrp : price * 1.3);
            const imgUrl = item.image || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=600&auto=format&fit=crop';
            const hoverImgUrl = item.hover_image || item.images?.[1]?.image_url || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop';
            const productSlug = item.slug || 'jewellery-item';

            return (
              <Link key={item.id} href={`/product/${productSlug}`} className="group bg-white rounded-2xl border border-[#EFE6D8] overflow-hidden shadow-2xs hover:shadow-md transition-all block shrink-0 snap-start w-52 xs:w-60 sm:w-64 lg:w-[calc((100%-3.5rem)/4.5)]">
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-110"
                  />
                  <Image
                    src={hoverImgUrl}
                    alt={`${item.name} - Hover View`}
                    fill
                    className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <span className="absolute top-2 left-2 bg-neutral-900 text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider z-10">
                    NEW
                  </span>
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#B38548] rounded-full shadow-xs transition-colors z-10">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-xs text-neutral-900 font-medium line-clamp-1 group-hover:text-[#B38548] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE6D8]/60">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5 leading-tight">
                      <span className="font-sans font-bold text-xs text-neutral-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {mrp && mrp > price && (
                        <span className="font-sans text-[10px] text-neutral-400 line-through">
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

      {/* 4. FEATURED COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight">
            FEATURED COLLECTIONS
          </h2>
        </div>

        <div className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory px-4 -mx-4 sm:px-0 sm:mx-0">
          {featuredCollections.map((col, idx) => (
            <Link key={idx} href={col.link} className="relative h-72 sm:h-80 rounded-2xl overflow-hidden group shadow-xs shrink-0 snap-center w-72 sm:w-auto bg-neutral-900 block cursor-pointer">
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                <h3 className="font-sans font-bold text-sm tracking-wider uppercase mb-1">
                  {col.title}
                </h3>
                <p className="text-[11px] text-neutral-200 line-clamp-2 mb-4 font-normal">
                  {col.subtitle}
                </p>
                <div>
                  <span className="inline-block px-4 py-2 bg-white text-neutral-900 font-bold text-[10px] uppercase tracking-wider rounded-lg group-hover:bg-[#B38548] group-hover:text-white transition-colors">
                    EXPLORE
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. TRADITIONAL & KUNDAN JEWELLERY COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#B38548]">👑</span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#B38548] uppercase">ROYAL ELEGANCE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
              KUNDAN & BRIDAL JEWELLERY
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Chokers, Jhumkas & Heritage Statement Sets</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#B38548] hover:underline shrink-0"
          >
            EXPLORE COLLECTION →
          </Link>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-3.5 sm:gap-5 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {displayTraditional.map((item: any) => {
            const variant = item.variants?.[0];
            const price = item.price ?? (variant ? variant.price : 2499);
            const mrp = item.mrp ?? (variant ? variant.mrp : price * 1.3);
            const imgUrl = item.image || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';
            const hoverImgUrl = item.hover_image || item.images?.[1]?.image_url || 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop';
            const productSlug = item.slug || 'kundan-necklace';

            return (
              <Link key={item.id} href={`/product/${productSlug}`} className="group bg-white rounded-2xl border border-[#EFE6D8] overflow-hidden shadow-2xs hover:shadow-md transition-all block shrink-0 snap-start w-52 xs:w-60 sm:w-64 lg:w-[calc((100%-3.5rem)/4.5)]">
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-110"
                  />
                  <Image
                    src={hoverImgUrl}
                    alt={`${item.name} - Hover View`}
                    fill
                    className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  {item.tag && (
                    <span className="absolute top-2 left-2 bg-[#B38548] text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider z-10">
                      {item.tag}
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#B38548] rounded-full shadow-xs transition-colors z-10">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-xs text-neutral-900 font-medium line-clamp-1 group-hover:text-[#B38548] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE6D8]/60">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5 leading-tight">
                      <span className="font-sans font-bold text-xs text-neutral-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {mrp && mrp > price && (
                        <span className="font-sans text-[10px] text-neutral-400 line-through">
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

      {/* PROMOTIONAL BANNER */}
      {promoStatus === 'ACTIVE' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
          <Link href={promoUrl} className="block group">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E8DEC8] bg-neutral-900">
              <div className="relative w-full aspect-[21/7] sm:aspect-[24/7]">
                <Image
                  src={promoImage}
                  alt="Discover ARILHA Jewellery by Irsa Khan"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                  priority
                />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 6. EVERYDAY & ANTI-TARNISH JEWELLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B38548]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#B38548] uppercase">EVERYDAY ESSENTIALS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
              ANTI-TARNISH & GOLD-PLATED JEWELLERY
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Minimalist Rings, Layered Chains & Daily Hoops</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#B38548] hover:underline shrink-0"
          >
            EXPLORE EVERYDAY →
          </Link>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-3.5 sm:gap-5 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {displayWestern.map((item: any) => {
            const variant = item.variants?.[0];
            const price = item.price ?? (variant ? variant.price : 1299);
            const mrp = item.mrp ?? (variant ? variant.mrp : price * 1.3);
            const imgUrl = item.image || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop';
            const hoverImgUrl = item.hover_image || item.images?.[1]?.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop';
            const productSlug = item.slug || 'gold-hoops';

            return (
              <Link key={item.id} href={`/product/${productSlug}`} className="group bg-[#FFFFFF] rounded-2xl border border-[#EFE6D8] overflow-hidden shadow-2xs hover:shadow-md transition-all block shrink-0 snap-start w-52 xs:w-60 sm:w-64 lg:w-[calc((100%-3.5rem)/4.5)]">
                <div className="relative aspect-3/4 bg-neutral-100 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:opacity-0 group-hover:scale-110"
                  />
                  <Image
                    src={hoverImgUrl}
                    alt={`${item.name} - Hover View`}
                    fill
                    className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  {item.tag && (
                    <span className="absolute top-2 left-2 bg-neutral-900 text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider z-10">
                      {item.tag}
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#B38548] rounded-full shadow-xs transition-colors z-10">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-xs text-neutral-900 font-medium line-clamp-1 group-hover:text-[#B38548] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE6D8]/60">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5 leading-tight">
                      <span className="font-sans font-bold text-xs text-neutral-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {mrp && mrp > price && (
                        <span className="font-sans text-[10px] text-neutral-400 line-through">
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

      {/* LIFESTYLE / CATEGORY OVERLAPPING 3D CAROUSEL */}
      <LifestyleCarousel />

      {/* WATCHES CLICKABLE BANNER SECTION */}
      {settings.watch_banner_status !== 'DISABLED' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
          <Link href={settings.watch_banner_url || '/collections/watches'} className="block group">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E8DEC8] bg-neutral-900">
              <div className="relative w-full aspect-[21/7] sm:aspect-[24/7]">
                <Image
                  src={settings.watch_banner_image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop'}
                  alt="Arilha Luxury Watches & Timepieces"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 7. WHY CHOOSE ARILHA? */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="bg-[#FAF4EB] border border-[#EFE6D8] rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="font-serif text-sm sm:text-lg md:text-xl text-neutral-900 font-medium tracking-tight">
              WHY CHOOSE ARILHA?
            </h3>
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-4 md:gap-6 text-center">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <Award className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">PREMIUM QUALITY</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Finest plating &amp; craftsmanship</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">SECURE PAYMENT</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">100% safe transactions</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">EASY RETURNS</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Hassle-free return policy</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">FAST DELIVERY</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Dispatched in 24-48 hrs</p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-[#B38548]" />
              <h4 className="font-bold text-[8px] sm:text-xs uppercase tracking-wider text-neutral-900 line-clamp-1">COD AVAILABLE</h4>
              <p className="text-[7.5px] sm:text-[10px] text-neutral-600 leading-tight">Pay cash on delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WATCH AND SHOP REELS */}
      <WatchAndShopSection />

      {/* 9. IRSA'S FAVOURITE COLLECTION */}
      <IrsasFavouriteSection />

      {/* 10. CUSTOMER TESTIMONIALS */}
      <TestimonialsSection />
    </div>
  );
}
