'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, ChevronRight, Smartphone, Globe, Eye, CheckCircle2 } from 'lucide-react';

export default function CustomerJourneyPage() {
  const [range, setRange] = useState('30d');
  const [journeys, setJourneys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJourneys = async () => {
    setIsLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
      const res = await fetch(`${apiBaseUrl}/admin/analytics/customer-journeys?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setJourneys(json.data || []);
        }
      }
    } catch (e) {}
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = 'Customer Journey Paths | ARILHA Admin';
    fetchJourneys();
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
              <Compass className="w-6 h-6 text-emerald-600" />
              <span>Customer Session Navigation Paths</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Reconstruct step-by-step navigation journeys of active store visitors
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

      {/* Journeys List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-2xl">
            Loading session navigation journeys...
          </div>
        ) : journeys.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-2xl">
            No session journeys recorded for this timeframe yet.
          </div>
        ) : (
          journeys.map((j, idx) => (
            <div key={j.session_id + idx} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-neutral-400">Session #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                    {j.device_type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Source: {j.traffic_source}
                  </span>
                  {j.has_purchased && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Converted Purchase
                    </span>
                  )}
                </div>

                <div className="text-right text-[11px] font-mono text-neutral-400">
                  {j.total_views} views • {j.total_active_seconds}s active • {j.created_at}
                </div>
              </div>

              {/* Path Node Sequence Flow */}
              <div className="flex items-center flex-wrap gap-2 pt-1">
                {j.path.map((url: string, pIdx: number) => (
                  <React.Fragment key={url + pIdx}>
                    <div className="px-3 py-1.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-mono font-bold text-neutral-800 flex items-center space-x-1.5">
                      <span className="text-[10px] text-neutral-400">{pIdx + 1}.</span>
                      <span className="truncate max-w-xs">{url}</span>
                    </div>
                    {pIdx < j.path.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
