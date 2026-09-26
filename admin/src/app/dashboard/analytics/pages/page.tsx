'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  ArrowLeft,
  Filter,
  BarChart3,
  Clock,
  ArrowDownUp,
  X,
  Smartphone,
  Globe,
  ShoppingCart,
  TrendingUp,
  Check,
} from 'lucide-react';

export default function AnalyticsPagesPage() {
  const [range, setRange] = useState('30d');
  const [sort, setSort] = useState('views');
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Page Detail View
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [pageDetail, setPageDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
      const res = await fetch(`${apiBaseUrl}/admin/analytics/pages?range=${range}&sort=${sort}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPages(json.data || []);
        }
      }
    } catch (e) {}
    setIsLoading(false);
  };

  const fetchPageDetail = async (url: string) => {
    setSelectedUrl(url);
    setIsDetailLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
      const res = await fetch(`${apiBaseUrl}/admin/analytics/pages/detail?url=${encodeURIComponent(url)}&range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPageDetail(json.data);
        }
      }
    } catch (e) {}
    setIsDetailLoading(false);
  };

  useEffect(() => {
    document.title = 'Most Viewed Pages | ARILHA Admin Analytics';
    fetchPages();
  }, [range, sort]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/analytics"
            className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Eye className="w-6 h-6 text-amber-600" />
              <span>Most Viewed Pages & Engagement</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Page views, unique visitors, active engagement duration, and scroll depth statistics
            </p>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center space-x-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 shadow-2xs focus:outline-none"
          >
            <option value="views">Sort by Most Viewed</option>
            <option value="visitors">Sort by Unique Visitors</option>
            <option value="time">Sort by Avg Time</option>
            <option value="scroll">Sort by Scroll Depth</option>
          </select>

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
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200/80">
            <tr>
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">Page URL</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Total Views</th>
              <th className="py-3.5 px-4 text-right">Unique Visitors</th>
              <th className="py-3.5 px-4 text-right">Avg Time</th>
              <th className="py-3.5 px-4 text-right">Avg Scroll</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400">Loading page analytics...</td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-400">No page view data recorded for this period yet.</td>
              </tr>
            ) : (
              pages.map((p, idx) => (
                <tr key={p.page_url} className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 truncate max-w-xs">{p.page_url}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase">
                      {p.page_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-neutral-900">{p.total_views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-purple-700">{p.unique_visitors.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{p.avg_time || 0}s</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">{p.avg_scroll || 0}%</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => fetchPageDetail(p.page_url)}
                      className="px-2.5 py-1 bg-[#B38548] hover:bg-[#996f3a] text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Deep Dive
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over / Modal Page Detail View */}
      {selectedUrl && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#B38548] uppercase tracking-wider">Page Analytics Detail</span>
                <h2 className="text-lg font-black text-neutral-900 truncate max-w-md">{selectedUrl}</h2>
              </div>
              <button onClick={() => setSelectedUrl(null)} className="p-2 hover:bg-neutral-100 rounded-xl">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {isDetailLoading ? (
              <p className="text-xs text-neutral-400 text-center py-12">Loading page detail breakdown...</p>
            ) : pageDetail ? (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
                    <span className="font-semibold text-neutral-500 block">Total Views</span>
                    <span className="text-2xl font-black text-neutral-900 block mt-1">{pageDetail.total_views}</span>
                  </div>
                  <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
                    <span className="font-semibold text-neutral-500 block">Unique Visitors</span>
                    <span className="text-2xl font-black text-purple-900 block mt-1">{pageDetail.unique_visitors}</span>
                  </div>
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="font-semibold text-neutral-500 block">Avg Active Time</span>
                    <span className="text-2xl font-black text-emerald-900 block mt-1">{pageDetail.avg_time_seconds}s</span>
                  </div>
                  <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100">
                    <span className="font-semibold text-neutral-500 block">Avg Scroll Depth</span>
                    <span className="text-2xl font-black text-sky-900 block mt-1">{pageDetail.avg_scroll_percentage}%</span>
                  </div>
                </div>

                {/* Traffic Sources for this page */}
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Traffic Sources to this Page</h4>
                  <div className="border border-neutral-100 rounded-xl divide-y">
                    {pageDetail.traffic_sources?.map((src: any) => (
                      <div key={src.traffic_source} className="p-3 flex justify-between">
                        <span className="font-semibold text-neutral-700">{src.traffic_source}</span>
                        <span className="font-bold text-neutral-900">{src.count} visits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
