import React from 'react';
import { Metadata } from 'next';
import { productService } from '@/services/productService';
import { JsonLd } from '@/components/ui/JsonLd';
import ProductDetailClient from './ProductDetailClient';
import { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await productService.getProductBySlug(slug);
  let product: Product | undefined = res.data;

  if (!product) {
    const catalogRes = await productService.getProducts({ page: 1, search: slug.replace(/-/g, ' ') });
    const allProductsRes = catalogRes.data?.length ? catalogRes : await productService.getProducts({ page: 1 });
    product = allProductsRes.data?.find((p: any) =>
      p.slug === slug ||
      String(p.id) === String(slug) ||
      p.slug?.includes(slug) ||
      slug.includes(p.slug) ||
      p.name?.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
    ) || allProductsRes.data?.[0];
  }

  if (!product) {
    return {
      title: 'Jewellery Collection | ARILHA',
      description: 'Discover modern Indian jewellery, gold-plated pieces, anti-tarnish items and statement designs at ARILHA by Irsa Khan.',
      alternates: {
        canonical: `https://arilha.com/product/${slug}`,
      },
    };
  }

  const title = `${product.name} | ARILHA`;
  const rawDescription = product.description || product.short_description || `Buy ${product.name} online at ARILHA. Discover modern Indian jewellery by Irsa Khan.`;
  const description = rawDescription.replace(/<[^>]*>?/gm, '').slice(0, 160).trim();
  const mainImage = product.images?.[0]?.image_url || 'https://arilha.com/logo.png';

  return {
    title,
    description,
    alternates: {
      canonical: `https://arilha.com/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://arilha.com/product/${slug}`,
      type: 'website',
      images: [
        {
          url: mainImage,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const res = await productService.getProductBySlug(slug);
  let product: Product | undefined = res.data;

  if (!product) {
    const catalogRes = await productService.getProducts({ page: 1, search: slug.replace(/-/g, ' ') });
    const allProductsRes = catalogRes.data?.length ? catalogRes : await productService.getProducts({ page: 1 });
    product = allProductsRes.data?.find((p: any) =>
      p.slug === slug ||
      String(p.id) === String(slug) ||
      p.slug?.includes(slug) ||
      slug.includes(p.slug) ||
      p.name?.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
    ) || allProductsRes.data?.[0];
  }

  const breadcrumbs = [
    { name: 'Home', item: 'https://arilha.com' },
    { name: 'Women', item: 'https://arilha.com/women' },
    ...(product?.category?.name
      ? [{ name: product.category.name, item: `https://arilha.com/women/${product.category.slug}` }]
      : []),
    { name: product?.name || slug, item: `https://arilha.com/product/${slug}` },
  ];

  return (
    <main>
      {product && (
        <>
          <JsonLd type="Product" product={product} />
          <JsonLd type="BreadcrumbList" breadcrumbs={breadcrumbs} />
        </>
      )}
      <ProductDetailClient initialProduct={product} />
    </main>
  );
}
