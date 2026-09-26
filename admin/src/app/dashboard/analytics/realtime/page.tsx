'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft, RefreshCw, Eye, Smartphone, Globe } from 'lucide-react';

export default function RealtimeAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealtime = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
      const res = await fetch(`${apiBaseUrl}/admin/analytics/realtime`, { cache: 'no-store' });
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
    document.title = 'Real-Time Active Visitors | ARILHA Admin';
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/analytics" className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50">
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span>Real-Time Active Store Visitors</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live traffic monitoring updated every 3 seconds (active in last 5 minutes)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-900 text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-1" />
          <span>Live Pulse Active</span>
        </div>
      </div>

      {/* Main Realtime Active Counter Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-black text-white p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold">Right Now</span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {isLoading ? '...' : (data?.active_visitor_count || 0)}
          </h2>
          <p className="text-xs text-neutral-400">Active visitors currently browsing ARILHA storefront</p>
        </div>

        <button
          onClick={fetchRealtime}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Refresh Now</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Pages Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Active Right Now by Page</h3>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 font-bold text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Page URL</th>
                  <th className="py-2.5 px-3 text-right">Active Visitors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data?.active_pages?.map((ap: any) => (
                  <tr key={ap.page_url}>
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-900 truncate max-w-xs">{ap.page_url}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-600">{ap.active_count}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-neutral-400">No active page views right now.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Visitor Sessions Stream */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Active Visitor Stream</h3>
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {data?.recent_sessions?.map((s: any, idx: number) => (
              <div key={s.session_id + idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-neutral-900 truncate max-w-xs">{s.current_page}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{s.device_type} • {s.traffic_source}</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
            )) || (
              <p className="py-8 text-center text-xs text-neutral-400">No active visitor sessions recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
