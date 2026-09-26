'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Eye,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Globe,
  Search,
  Zap,
  Smartphone,
  Compass,
  ArrowRight,
  Filter,
  Calendar,
  Check,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AnalyticsOverviewPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
      const res = await fetch(`${apiBaseUrl}/admin/analytics/overview?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (e) {}
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = 'Customer Analytics | ARILHA Admin';
    fetchOverview();
  }, [range]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#B38548]" />
            <span>Customer Analytics Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Deep customer intelligence, traffic sources, page views, funnels, and customer journeys
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 bg-white border border-neutral-200 p-1 rounded-xl shadow-2xs">
          {['today', '7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                range === r ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Sub-Modules Quick Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <Link
          href="/dashboard/analytics/customers"
          className="p-3 bg-[#B38548] text-white hover:bg-[#996f3a] border border-[#B38548] rounded-2xl text-center space-y-1 transition-all group shadow-2xs"
        >
          <Users className="w-5 h-5 mx-auto text-white group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold block truncate">Customer Directory</span>
        </Link>

        <Link
          href="/dashboard/analytics/pages"
          className="p-3 bg-white hover:bg-amber-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Eye className="w-5 h-5 mx-auto text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Pages</span>
        </Link>

        <Link
          href="/dashboard/analytics/products"
          className="p-3 bg-white hover:bg-sky-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Package className="w-5 h-5 mx-auto text-sky-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Products</span>
        </Link>

        <Link
          href="/dashboard/analytics/collections"
          className="p-3 bg-white hover:bg-purple-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Layers className="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Collections</span>
        </Link>

        <Link
          href="/dashboard/analytics/customer-journey"
          className="p-3 bg-white hover:bg-emerald-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Compass className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Journeys</span>
        </Link>

        <Link
          href="/dashboard/analytics/traffic-sources"
          className="p-3 bg-white hover:bg-indigo-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Globe className="w-5 h-5 mx-auto text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Traffic</span>
        </Link>

        <Link
          href="/dashboard/analytics/search"
          className="p-3 bg-white hover:bg-rose-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Search className="w-5 h-5 mx-auto text-rose-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Searches</span>
        </Link>

        <Link
          href="/dashboard/analytics/checkout-funnel"
          className="p-3 bg-white hover:bg-teal-50/50 border border-neutral-200/80 rounded-2xl text-center space-y-1 transition-all group"
        >
          <ShoppingCart className="w-5 h-5 mx-auto text-teal-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-800 block truncate">Funnel</span>
        </Link>

        <Link
          href="/dashboard/analytics/realtime"
          className="p-3 bg-neutral-900 text-white hover:bg-black border border-neutral-800 rounded-2xl text-center space-y-1 transition-all group"
        >
          <Zap className="w-5 h-5 mx-auto text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold block truncate">Real-Time</span>
        </Link>
      </div>

      {/* 4 Main Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Total Page Views</span>
          <p className="text-3xl font-black text-neutral-900 mt-2">
            {isLoading ? '...' : (data?.total_page_views || 0).toLocaleString()}
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2">
            Across all storefront routes
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Unique Visitors</span>
          <p className="text-3xl font-black text-neutral-900 mt-2">
            {isLoading ? '...' : (data?.unique_visitors || 0).toLocaleString()}
          </p>
          <p className="text-[11px] font-semibold text-purple-600 mt-2">
            Anonymous & logged-in users
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Add-To-Cart Events</span>
          <p className="text-3xl font-black text-neutral-900 mt-2">
            {isLoading ? '...' : (data?.add_to_cart_events || 0).toLocaleString()}
          </p>
          <p className="text-[11px] font-semibold text-amber-600 mt-2">
            Product intent signals
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Store Conversion Rate</span>
          <p className="text-3xl font-black text-neutral-900 mt-2">
            {isLoading ? '...' : `${data?.conversion_rate || 0}%`}
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2">
            Confirmed orders / Visitors
          </p>
        </div>
      </div>

      {/* Main Analytical Deep-Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Pages Module Preview */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600" />
              <span>Most Viewed Store Pages</span>
            </h3>
            <Link
              href="/dashboard/analytics/pages"
              className="text-xs font-bold text-[#B38548] hover:underline flex items-center"
            >
              View Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <p className="text-xs text-neutral-500">
            Discover which pages, products, and collections receive the most traffic, longest active time, and highest scroll depth.
          </p>
        </div>

        {/* Customer Journey Module Preview */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Customer Session Paths</span>
            </h3>
            <Link
              href="/dashboard/analytics/customer-journey"
              className="text-xs font-bold text-[#B38548] hover:underline flex items-center"
            >
              Explore Journeys <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <p className="text-xs text-neutral-500">
            Reconstruct complete customer navigation paths step-by-step from initial landing page to final checkout or exit.
          </p>
        </div>
      </div>
    </div>
  );
}
