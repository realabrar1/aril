import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { collectionService, Collection } from '@/services/collectionService';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'All Collections | Anti-Tarnish & Gold Plated Jewellery | ARILHA',
  description: 'Explore all jewellery collections by ARILHA by Irsa Khan. Discover handcrafted Kundan sets, daily anti-tarnish hoops, stacking rings, luxury watches, and festive edits.',
  alternates: {
    canonical: 'https://arilha.com/collections',
  },
  openGraph: {
    title: 'All Collections | ARILHA Jewellery',
    description: 'Explore all jewellery collections by ARILHA by Irsa Khan. Handcrafted Kundan sets, anti-tarnish hoops, stacking rings, luxury watches, and festive edits.',
    url: 'https://arilha.com/collections',
    type: 'website',
  },
};

const defaultCollections: Partial<Collection>[] = [
  {
    id: 11,
    name: "Irsa's Favourite",
    slug: 'irsa-favourite',
    description: "Irsa Khan's personal handpicked signature jewellery pieces.",
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    products_count: 5,
  },
  {
    id: 1,
    name: 'Earrings',
    slug: 'earrings',
    description: 'Explore Arilha\'s collection of elegant earrings designed for everyday wear and special occasions.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    products_count: 2,
  },
  {
    id: 2,
    name: 'Chains',
    slug: 'chains',
    description: 'Sleek layered chains, gold pendants, and daily worn neckpieces.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    products_count: 3,
  },
  {
    id: 3,
    name: 'Rings',
    slug: 'rings',
    description: 'Minimal stacking rings, solitaire crystal bands, and bold statement rings.',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    products_count: 2,
  },
  {
    id: 4,
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Modern anti-tarnish cuffs, floral bangles, and delicate wrist charms.',
    image_url: 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=800&auto=format&fit=crop',
    products_count: 2,
  },
  {
    id: 5,
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Royal Kundan chokers, bridal sets, and handcrafted statement necklaces.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    products_count: 4,
  },
  {
    id: 6,
    name: 'Watches',
    slug: 'watches',
    description: 'Timeless luxury watches and jewellery-inspired wristwear.',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    products_count: 1,
  },
  {
    id: 7,
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Freshly dropped anti-tarnish and festive jewellery designs.',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
    products_count: 6,
  },
  {
    id: 8,
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Our most loved and iconic jewellery pieces as rated by customers.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    products_count: 8,
  },
  {
    id: 9,
    name: 'Diwali Collection',
    slug: 'diwali',
    description: 'Festive jewellery for your Diwali celebrations. Celebrate every moment in gold.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    products_count: 5,
  },
  {
    id: 10,
    name: 'Exclusive 999 Collection',
    slug: 'exclusive-999',
    description: 'Premium budget-friendly luxury jewellery under ₹999.',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    products_count: 4,
  },
];

export default async function CollectionsLandingPage() {
  const res = await collectionService.getCollections().catch(() => ({ success: false, data: [] }));
  const collectionsList = (res.success && res.data && res.data.length > 0) ? res.data : defaultCollections;

  return (
    <div className="space-y-10 pb-16 pt-4">
      {/* Breadcrumb Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 text-xs text-neutral-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="font-bold text-neutral-900">Collections</span>
      </nav>

      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 sm:p-12 text-center border border-[#E8DEC8]">
          <div className="absolute inset-0 opacity-40 z-0">
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop"
              alt="Arilha Collections"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#D4A86A]">
              <Sparkles className="w-3 h-3 text-[#D4A86A]" />
              <span>CURATED MERCHANDISING</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight uppercase">
              OUR COLLECTIONS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Discover Arilha’s thoughtfully curated jewellery collections — from everyday waterproof anti-tarnish hoops to royal festive Kundan chokers and luxury timepieces.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionsList.map((col) => {
            const itemCount = col.products_count ?? col.product_count ?? 0;
            const bgImage = col.image_url || col.banner_url || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop';

            return (
              <div
                key={col.slug}
                className="group bg-white rounded-3xl border border-[#EFE6D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Collection Card Image */}
                  <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                    <Image
                      src={bgImage}
                      alt={col.name || 'Collection'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-neutral-900 font-bold text-xs px-3 py-1 rounded-full shadow-xs flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#B38548]" />
                      <span>{itemCount} {itemCount === 1 ? 'Product' : 'Products'}</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-6 space-y-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-medium text-neutral-900 group-hover:text-[#B38548] transition-colors uppercase">
                      {col.name}
                    </h2>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {col.description || 'Explore our handpicked selection of premium jewellery pieces.'}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/collections/${col.slug}`}
                    className="inline-flex items-center justify-between w-full px-5 py-3 bg-[#FAF6F0] group-hover:bg-[#B38548] text-neutral-900 group-hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-[#EFE6D8] group-hover:border-[#B38548] transition-all duration-300"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
