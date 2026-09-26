'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AnalyticsSearchPage() {
  const [range, setRange] = useState('30d');
  const [searched, setSearched] = useState<any[]>([]);
  const [zeroResults, setZeroResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Search Behavior Analytics | ARILHA Admin';

    const loadData = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
        const res = await fetch(`${apiBaseUrl}/admin/analytics/search?range=${range}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSearched(json.data.most_searched || []);
            setZeroResults(json.data.zero_results || []);
          }
        }
      } catch (e) {}
      setIsLoading(false);
    };

    loadData();
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
              <Search className="w-6 h-6 text-rose-600" />
              <span>Search Behavior & Zero-Result Analytics</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Discover what customers are searching for and identify zero-result search gaps
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Queries */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Most Searched Terms</h3>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 font-bold text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3 text-right">Search Volume</th>
                  <th className="py-2.5 px-3 text-right">Avg Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {searched.map((s) => (
                  <tr key={s.search_query}>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">"{s.search_query}"</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-rose-700">{s.search_count}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-600">{Math.round(s.avg_results)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zero Results Searches */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-base text-neutral-900">Zero-Result Searches</h3>
          </div>
          <p className="text-xs text-neutral-500">Searches that returned 0 products — use to expand catalog offerings!</p>

          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 font-bold text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Missing Search Query</th>
                  <th className="py-2.5 px-3 text-right">Failed Searches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {zeroResults.map((z) => (
                  <tr key={z.search_query}>
                    <td className="py-2.5 px-3 font-bold text-rose-950">"{z.search_query}"</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-rose-600">{z.search_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
