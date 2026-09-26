import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { collectionService } from '@/services/collectionService';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { CollectionFilterControls } from '@/components/collection/CollectionFilterControls';
import { Sparkles, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    gender?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await collectionService.getCollectionBySlug(slug).catch(() => null);

  if (!res || !res.success || !res.data) {
    return {
      title: 'Collection Not Found | Arilha',
    };
  }

  const col = res.data.collection;
  const title = col.seo_title || `${col.name} | Anti-Tarnish & Gold-Plated Jewellery | ARILHA`;
  const description = col.seo_description || col.description || `Explore ARILHA's curated ${col.name} collection. Modern Indian jewellery by Irsa Khan.`;
  const ogImage = col.banner_url || col.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop';
  const canonicalUrl = `https://arilha.com/collections/${col.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImage, alt: col.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CollectionDetailPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const currentSort = resolvedSearchParams.sort || 'newest';
  const currentSearch = resolvedSearchParams.search || '';
  const currentGender = resolvedSearchParams.gender || '';
  const minPrice = resolvedSearchParams.min_price ? Number(resolvedSearchParams.min_price) : undefined;
  const maxPrice = resolvedSearchParams.max_price ? Number(resolvedSearchParams.max_price) : undefined;
  const page = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;

  const res = await collectionService
    .getCollectionBySlug(slug, {
      sort: currentSort,
      search: currentSearch,
      gender: currentGender,
      min_price: minPrice,
      max_price: maxPrice,
      page,
      per_page: 24,
    })
    .catch(() => null);

  if (!res || !res.success || !res.data) {
    notFound();
  }

  const { collection, products } = res.data;
  const bannerImage = collection.banner_url || collection.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop';

  // JSON-LD Structured Data for Breadcrumbs & ItemList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://arilha.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: 'https://arilha.com/collections',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: collection.name,
        item: `https://arilha.com/collections/${collection.slug}`,
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.name,
    description: collection.description,
    numberOfItems: products.length,
    itemListElement: products.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: `https://arilha.com/product/${item.slug}`,
    })),
  };

  return (
    <div className="space-y-8 pb-16 pt-4">
      {/* JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 text-xs text-neutral-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <Link href="/collections" className="hover:text-neutral-900 transition-colors">
          Collections
        </Link>
        <span>&gt;</span>
        <span className="font-bold text-neutral-900">{collection.name}</span>
      </nav>

      {/* Collection Hero Header (100% Full Width) */}
      <section className="w-full -mt-4">
        <div className="relative w-full bg-neutral-950 text-white min-h-[260px] sm:min-h-[360px] flex items-center py-10 sm:py-16 border-b border-[#E8DEC8] overflow-hidden">
          <Image
            src={bannerImage}
            alt={collection.name}
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#D4A86A]">
              <Layers className="w-3 h-3 text-[#D4A86A]" />
              <span>COLLECTION • {collection.product_count ?? products.length} ITEMS</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight uppercase">
              {collection.name}
            </h1>

            {collection.description && (
              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Collection Controls Bar (Sorting & Search Filters) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <CollectionFilterControls
          slug={collection.slug}
          productCount={products.length}
          currentSort={currentSort}
          currentSearch={currentSearch}
          currentGender={currentGender}
        />
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF6F0] rounded-3xl border border-[#EFE6D8] space-y-3">
            <Sparkles className="w-10 h-10 text-[#B38548] mx-auto" />
            <h3 className="font-serif text-xl font-medium text-neutral-900">No Products Found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              There are currently no products matching your selected search or filter criteria in this collection.
            </p>
            <Link
              href={`/collections/${collection.slug}`}
              className="inline-block px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#B38548] transition-colors mt-2"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
