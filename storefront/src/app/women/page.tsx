import React from 'react';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jewellery Collection | ARILHA',
  description: 'Shop handcrafted gold-plated jewellery, anti-tarnish pieces, Kundan chokers, jhumkas and statement rings at ARILHA by Irsa Khan.',
  alternates: {
    canonical: 'https://arilha.com/women',
  },
};

export default async function WomenPage() {
  const [categoriesRes, productsRes] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts({ page: 1 }),
  ]);

  const categories = categoriesRes.data || [];
  const products = productsRes.data || [];

  const womenCategory = categories.find((c) => c.slug === 'women') || categories[0];
  const subCategories = categories.filter((c) => c.parent_id === womenCategory?.id || c.slug !== 'women');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#B38548] block">
          ARILHA EDIT
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
          Women's Jewellery Collection
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
          Trending Women's Jewellery
        </h2>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
