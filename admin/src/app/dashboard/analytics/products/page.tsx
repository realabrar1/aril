'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ArrowLeft, TrendingUp, ShoppingBag, IndianRupee, ArrowUpRight } from 'lucide-react';

export default function AnalyticsProductsPage() {
  const [range, setRange] = useState('30d');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
      const res = await fetch(`${apiBaseUrl}/admin/analytics/products?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProducts(json.data || []);
        }
      }
    } catch (e) {}
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = 'Product Velocity & Analytics | ARILHA Admin';
    fetchProducts();
  }, [range]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/analytics" className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50">
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-sky-600" />
              <span>Product Analytics & Conversion Velocity</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Views, unique viewers, add-to-carts, buy now clicks, confirmed purchases, and revenue per product
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-white border border-neutral-200 p-1 rounded-xl shadow-2xs">
          {['today', '7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                range === r ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200/80">
            <tr>
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">Product Name</th>
              <th className="py-3.5 px-4 text-right">Price</th>
              <th className="py-3.5 px-4 text-right">Total Views</th>
              <th className="py-3.5 px-4 text-right">Unique Viewers</th>
              <th className="py-3.5 px-4 text-right">Add to Carts</th>
              <th className="py-3.5 px-4 text-right">Cart Rate</th>
              <th className="py-3.5 px-4 text-right">Purchases</th>
              <th className="py-3.5 px-4 text-right">Conversion Rate</th>
              <th className="py-3.5 px-4 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-neutral-400">Loading product analytics...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-neutral-400">No product analytics data available.</td>
              </tr>
            ) : (
              products.map((p, idx) => (
                <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-neutral-900">{p.name}</td>
                  <td className="py-3 px-4 text-right font-mono text-neutral-600">₹{p.price}</td>
                  <td className="py-3 px-4 text-right font-black text-neutral-900">{p.views}</td>
                  <td className="py-3 px-4 text-right font-bold text-purple-700">{p.unique_viewers}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-700">{p.add_to_carts}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">{p.add_to_cart_rate}%</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-800">{p.purchases}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{p.conversion_rate}%</td>
                  <td className="py-3 px-4 text-right font-black text-neutral-900">₹{p.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
