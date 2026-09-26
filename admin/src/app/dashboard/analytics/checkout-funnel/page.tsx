'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function CheckoutFunnelPage() {
  const [range, setRange] = useState('30d');
  const [funnel, setFunnel] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Checkout Funnel Analytics | ARILHA Admin';

    const loadData = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
        const res = await fetch(`${apiBaseUrl}/admin/analytics/checkout-funnel?range=${range}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setFunnel(json.data || []);
          }
        }
      } catch (e) {}
      setIsLoading(false);
    };

    loadData();
  }, [range]);

  const maxCount = funnel.length > 0 ? (funnel[0].count || 1) : 1;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/analytics" className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50">
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-teal-600" />
              <span>7-Stage E-Commerce Conversion Funnel</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Track conversion drop-off percentages from initial store visit to paid order completion
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

      {/* Funnel Visual Stack */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-neutral-900">Conversion Funnel Drop-off Analysis</h3>

        <div className="space-y-4 pt-4">
          {funnel.map((item, idx) => {
            const percentOfFirst = Math.round((item.count / maxCount) * 100);
            const prevCount = idx > 0 ? (funnel[idx - 1].count || 1) : item.count;
            const dropRate = idx > 0 ? Math.round(((prevCount - item.count) / (prevCount || 1)) * 100) : 0;

            return (
              <div key={item.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-neutral-900 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span>{item.stage}</span>
                  </span>

                  <div className="flex items-center space-x-3">
                    {idx > 0 && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        -{dropRate}% drop-off
                      </span>
                    )}
                    <span className="font-mono text-sm text-neutral-900">{item.count.toLocaleString()}</span>
                    <span className="font-mono text-xs text-neutral-400">({percentOfFirst}%)</span>
                  </div>
                </div>

                <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden p-0.5 border border-neutral-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, percentOfFirst)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
