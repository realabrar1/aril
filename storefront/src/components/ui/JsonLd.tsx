'use client';

import React from 'react';
import { Product } from '@/types';

interface JsonLdProps {
  type: 'Product' | 'Organization' | 'WebSite' | 'BreadcrumbList' | 'FAQPage' | 'Article';
  product?: Product;
  breadcrumbs?: { name: string; item: string }[];
  faqs?: { q: string; a: string }[];
  article?: {
    title: string;
    description: string;
    slug: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    authorName?: string;
  };
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, product, breadcrumbs, faqs, article }) => {
  let schema: Record<string, unknown> | null = null;

  if (type === 'Organization') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://arilha.com/#organization',
      name: 'ARILHA',
      alternateName: 'ARILHA by Irsa Khan',
      url: 'https://arilha.com',
      logo: 'https://arilha.com/logo.png',
      description: 'ARILHA by Irsa Khan is a modern Indian jewellery brand offering gold-plated jewellery, anti-tarnish everyday pieces, Kundan chokers, jhumkas, rings, and statement accessories.',
      sameAs: [
        'https://www.instagram.com/arilha.co/',
        'https://www.facebook.com/profile.php?id=61593964537005',
        'https://www.pinterest.com/Arilha_co',
        'https://x.com/arilha_co',
        'https://www.youtube.com/@arilha_co',
      ],
    };
  } else if (type === 'WebSite') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://arilha.com/#website',
      name: 'ARILHA',
      alternateName: 'ARILHA by Irsa Khan',
      url: 'https://arilha.com',
      publisher: {
        '@id': 'https://arilha.com/#organization',
      },
    };
  } else if (type === 'FAQPage' && faqs) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
  } else if (type === 'Article' && article) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image || 'https://arilha.com/logo.png',
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: {
        '@type': 'Organization',
        name: article.authorName || 'ARILHA Editorial Team',
        url: 'https://arilha.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'ARILHA',
        logo: {
          '@type': 'ImageObject',
          url: 'https://arilha.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://arilha.com/blog/${article.slug}`,
      },
    };
  } else if (type === 'BreadcrumbList' && breadcrumbs) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: b.name,
        item: b.item,
      })),
    };
  } else if (type === 'Product' && product) {
    const variants = product.variants || [];
    const minPrice = product.price || (variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0);

    // Check if any variant has stock or if product is active
    const hasStock = variants.length > 0
      ? variants.some((v) => (v.stock ?? 1) > 0)
      : product.status !== 'INACTIVE';

    const imageUrls = product.images && product.images.length > 0
      ? product.images.map((img) => img.image_url).filter(Boolean)
      : [];

    const returnPolicySchema = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    };

    const shippingDetailsSchema = {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: minPrice >= 899 ? 0 : 50,
        currency: 'INR',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'IN',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 2,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 2,
          maxValue: 5,
          unitCode: 'DAY',
        },
      },
    };

    const offerSchema = variants.length > 0
      ? variants.map((v) => ({
        '@type': 'Offer',
        sku: v.sku || `${product.sku}-${v.id}`,
        priceCurrency: 'INR',
        price: v.price || minPrice,
        availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://arilha.com/product/${product.slug}`,
        hasMerchantReturnPolicy: returnPolicySchema,
        shippingDetails: shippingDetailsSchema,
      }))
      : {
        '@type': 'Offer',
        url: `https://arilha.com/product/${product.slug}`,
        priceCurrency: 'INR',
        price: minPrice,
        availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        hasMerchantReturnPolicy: returnPolicySchema,
        shippingDetails: shippingDetailsSchema,
      };

    schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: imageUrls.length > 0 ? imageUrls : ['https://arilha.com/logo.png'],
      description: product.description || product.short_description || `Buy ${product.name} online at ARILHA.`,
      sku: product.sku || `ARL-${product.id}`,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'ARILHA',
      },
      offers: offerSchema,
    };

    // Only include AggregateRating if real rating data exists
    if (product.rating && Number(product.rating) > 0 && product.review_count) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(product.rating),
        reviewCount: product.review_count,
      };
    }
  }

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
