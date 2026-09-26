'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, ArrowLeft, Target, LogOut, ArrowRight } from 'lucide-react';

export default function TrafficSourcesPage() {
  const [range, setRange] = useState('30d');
  const [sources, setSources] = useState<any[]>([]);
  const [utmCampaigns, setUtmCampaigns] = useState<any[]>([]);
  const [landings, setLandings] = useState<any[]>([]);
  const [exits, setExits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Traffic Sources & UTM Campaigns | ARILHA Admin';

    const loadData = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
        const [res1, res2] = await Promise.all([
          fetch(`${apiBaseUrl}/admin/analytics/traffic-sources?range=${range}`),
          fetch(`${apiBaseUrl}/admin/analytics/landing-pages?range=${range}`),
        ]);

        if (res1.ok) {
          const json1 = await res1.json();
          if (json1.success) {
            setSources(json1.data.sources || []);
            setUtmCampaigns(json1.data.utm_campaigns || []);
          }
        }

        if (res2.ok) {
          const json2 = await res2.json();
          if (json2.success) {
            setLandings(json2.data.landing_pages || []);
            setExits(json2.data.exit_pages || []);
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
              <Globe className="w-6 h-6 text-indigo-600" />
              <span>Traffic Sources & Campaign Tracking</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Organic, social, direct, referral traffic, UTM campaign parameters, landing & exit pages
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
        {/* Traffic Sources Table */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Traffic Source Distribution</h3>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 font-bold text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3 text-right">Sessions</th>
                  <th className="py-2.5 px-3 text-right">Visitors</th>
                  <th className="py-2.5 px-3 text-right">Add To Cart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sources.map((s) => (
                  <tr key={s.traffic_source}>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">{s.traffic_source}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">{s.sessions}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-700">{s.visitors}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700">{s.add_to_carts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Landing Pages Table */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Top Entry Landing Pages</h3>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 font-bold text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Landing URL</th>
                  <th className="py-2.5 px-3 text-right">Sessions</th>
                  <th className="py-2.5 px-3 text-right">Visitors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {landings.map((l) => (
                  <tr key={l.landing_page}>
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-900 truncate max-w-xs">{l.landing_page}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">{l.sessions}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-700">{l.visitors}</td>
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
