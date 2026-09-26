'use client';

import React, { useEffect, useState, useRef } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats } from '@/types';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  Download,
  BarChart2,
  Star,
  Eye,
  ArrowRight,
  LayoutGrid,
  ShoppingCart,
  Sparkles,
  Calendar,
  Check,
  Layers,
  Shirt,
  Warehouse,
  Truck,
  Ticket,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Dropdown States
  const [dateRange, setDateRange] = useState('24 Sep 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [timeFilter, setTimeFilter] = useState('This Week');
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);

  const [visitorCount, setVisitorCount] = useState<number>(0);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const timeFilterRef = useRef<HTMLDivElement>(null);

  const dateOptions = [
    'Today (24 Sep)',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Custom Range...',
  ];

  const timeFilterOptions = ['This Week', 'Last Week', 'This Month', 'This Year'];

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard metrics.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to communicate with dashboard API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard | ARILHA Admin';
    fetchDashboardStats();

    const fetchVisitorStats = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
        const res = await fetch(`${apiBaseUrl}/admin/analytics/visitors`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setVisitorCount(json.data.total_visitors ?? 0);
          }
        }
      } catch (err) {}
    };

    fetchVisitorStats();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target as Node)) {
        setIsTimeFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CSV Report Generator Function
  const exportDashboardCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Timestamp'],
      ['Total Sales', `₹${stats?.todays_sales || 0}`, new Date().toISOString()],
      ['Orders Today', stats?.orders_today || 0, new Date().toISOString()],
      ['Pending Orders', stats?.pending_orders || 0, new Date().toISOString()],
      ['Total Customers', stats?.total_customers || 0, new Date().toISOString()],
      ['Low Stock Items', stats?.low_stock_products || 0, new Date().toISOString()],
      ['Total Store Visitors', visitorCount || 0, new Date().toISOString()],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ARILHA_Dashboard_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            Welcome back, Administrator <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative">
          {/* Interactive Date Picker Dropdown */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              className="flex items-center space-x-2 bg-white border border-neutral-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B38548]/30"
            >
              <Calendar className="w-3.5 h-3.5 text-[#B38548]" />
              <span>📅 {dateRange}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-1.5">Select Period</div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setIsDatePickerOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                      dateRange === opt ? 'bg-amber-50 text-amber-900 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {dateRange === opt && <Check className="w-3.5 h-3.5 text-[#B38548]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report CSV Button */}
          <button
            onClick={exportDashboardCSV}
            className="flex items-center space-x-2 bg-[#B38548] hover:bg-[#996f3a] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Download CSV Sales Report"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Mobile Application Icon Grid Launcher (Optimized Mobile App Native UI - Cream Theme) */}
      <div className="block md:hidden bg-[#FAF6F0] p-4 rounded-3xl text-neutral-900 shadow-xs space-y-3 border border-[#EFE6D8]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B38548] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5C5449]">Quick App Launcher</span>
          </div>
          <span className="text-[10px] font-bold bg-[#B38548]/15 px-2.5 py-0.5 rounded-full text-[#8C632B] flex items-center gap-1 border border-[#B38548]/20">
            <span>✦</span> Mobile UI
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {/* Products App Icon */}
          <Link
            href="/dashboard/products"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            <div className="p-2.5 bg-amber-100/70 text-amber-800 rounded-xl mb-1.5 shadow-2xs">
              <Shirt className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Products</span>
          </Link>

          {/* Orders App Icon */}
          <Link
            href="/dashboard/orders"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            {(stats?.orders_today || 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white">
                {stats?.orders_today}
              </span>
            )}
            <div className="p-2.5 bg-emerald-100/70 text-emerald-800 rounded-xl mb-1.5 shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Orders</span>
          </Link>

          {/* Collections App Icon */}
          <Link
            href="/dashboard/collections"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            <div className="p-2.5 bg-purple-100/70 text-[#966C32] rounded-xl mb-1.5 shadow-2xs">
              <Layers className="w-5 h-5 text-[#B38548]" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Collections</span>
          </Link>

          {/* Inventory App Icon */}
          <Link
            href="/dashboard/inventory"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            {(stats?.low_stock_products || 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white">
                {stats?.low_stock_products}
              </span>
            )}
            <div className="p-2.5 bg-orange-100/70 text-orange-800 rounded-xl mb-1.5 shadow-2xs">
              <Warehouse className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Stock</span>
          </Link>

          {/* Analytics App Icon */}
          <Link
            href="/dashboard/analytics"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            <div className="p-2.5 bg-blue-100/70 text-blue-800 rounded-xl mb-1.5 shadow-2xs">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Analytics</span>
          </Link>

          {/* Shipping App Icon */}
          <Link
            href="/dashboard/shipping"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            <div className="p-2.5 bg-cyan-100/70 text-cyan-800 rounded-xl mb-1.5 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Shipping</span>
          </Link>

          {/* Coupons App Icon */}
          <Link
            href="/dashboard/coupons"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            <div className="p-2.5 bg-rose-100/70 text-rose-800 rounded-xl mb-1.5 shadow-2xs">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Coupons</span>
          </Link>

          {/* Settings App Icon */}
          <Link
            href="/dashboard/settings"
            className="flex flex-col items-center justify-center p-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#E8DEC8] rounded-2xl transition-all active:scale-90 shadow-2xs group relative"
          >
            <div className="p-2.5 bg-neutral-100 text-neutral-700 rounded-xl mb-1.5 shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 text-center leading-tight">Settings</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards Grid (Single Row Grid on All Devices) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {/* Total Sales */}
        <Link href="/dashboard/orders" className="block group min-w-0">
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-neutral-200/70 shadow-2xs hover:border-[#B38548] hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 group-hover:text-[#B38548] transition-colors truncate block">Total Sales</span>
                <p className="text-base sm:text-2xl lg:text-3xl font-black text-neutral-900 mt-1 sm:mt-2 tracking-tight truncate">
                  ₹{stats?.todays_sales ? stats.todays_sales.toLocaleString('en-IN') : '0'}
                </p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <IndianRupee className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex items-center text-[9px] sm:text-xs font-semibold text-emerald-600 mt-2 sm:mt-4 truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" />
              <span className="truncate">0% vs yesterday</span>
            </div>
          </div>
        </Link>

        {/* Orders Today */}
        <Link href="/dashboard/orders" className="block group min-w-0">
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-neutral-200/70 shadow-2xs hover:border-sky-500 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 group-hover:text-sky-600 transition-colors truncate block">Orders Today</span>
                <p className="text-base sm:text-2xl lg:text-3xl font-black text-neutral-900 mt-1 sm:mt-2 tracking-tight truncate">
                  {stats?.orders_today || 0}
                </p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[9px] sm:text-xs font-medium text-neutral-500 mt-2 sm:mt-4 truncate">
              {stats?.pending_orders || 0} pending
            </p>
          </div>
        </Link>

        {/* Customers */}
        <Link href="/dashboard/customers" className="block group min-w-0">
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-neutral-200/70 shadow-2xs hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 group-hover:text-purple-600 transition-colors truncate block">Customers</span>
                <p className="text-base sm:text-2xl lg:text-3xl font-black text-neutral-900 mt-1 sm:mt-2 tracking-tight truncate">
                  {stats?.total_customers ? stats.total_customers.toLocaleString('en-IN') : 0}
                </p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[9px] sm:text-xs font-medium text-purple-600 mt-2 sm:mt-4 truncate">
              0 new this week
            </p>
          </div>
        </Link>

        {/* Low Stock Items */}
        <Link href="/dashboard/inventory" className="block group min-w-0">
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-neutral-200/70 shadow-2xs hover:border-orange-500 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 group-hover:text-orange-600 transition-colors truncate block">Low Stock</span>
                <p className="text-base sm:text-2xl lg:text-3xl font-black text-neutral-900 mt-1 sm:mt-2 tracking-tight truncate">
                  {stats?.low_stock_products || 0}
                </p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[9px] sm:text-xs font-medium text-orange-600 mt-2 sm:mt-4 truncate">
              Below limit
            </p>
          </div>
        </Link>
      </div>

      {/* Main 2-Column Dashboard Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Columns / ~65%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sales Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Sales Overview</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Track your store performance</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4 text-xs font-medium text-neutral-500 mr-2">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-1 bg-[#B38548] rounded-full" />
                    <span>This Week</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-[2px] bg-neutral-400 border-t border-dashed border-neutral-400" />
                    <span>Last Week</span>
                  </span>
                </div>

                {/* Interactive Time Filter Dropdown */}
                <div className="relative" ref={timeFilterRef}>
                  <button
                    onClick={() => setIsTimeFilterOpen((prev) => !prev)}
                    className="flex items-center space-x-1.5 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none"
                  >
                    <span>{timeFilter}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isTimeFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isTimeFilterOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-1 animate-in fade-in duration-150">
                      {timeFilterOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setTimeFilter(opt);
                            setIsTimeFilterOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                            timeFilter === opt ? 'bg-amber-50 text-amber-900 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {timeFilter === opt && <Check className="w-3.5 h-3.5 text-[#B38548]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Smooth Dual Line Chart Canvas (SVG Curve) */}
            <div className="relative h-56 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="10" x2="700" y2="10" stroke="#F3F4F6" strokeWidth="1" />
                <text x="0" y="14" fill="#9CA3AF" fontSize="10">₹10K</text>

                <line x1="0" y1="50" x2="700" y2="50" stroke="#F3F4F6" strokeWidth="1" />
                <text x="0" y="54" fill="#9CA3AF" fontSize="10">₹7.5K</text>

                <line x1="0" y1="90" x2="700" y2="90" stroke="#F3F4F6" strokeWidth="1" />
                <text x="0" y="94" fill="#9CA3AF" fontSize="10">₹5K</text>

                <line x1="0" y1="130" x2="700" y2="130" stroke="#F3F4F6" strokeWidth="1" />
                <text x="0" y="134" fill="#9CA3AF" fontSize="10">₹2.5K</text>

                <line x1="0" y1="170" x2="700" y2="170" stroke="#F3F4F6" strokeWidth="1" />
                <text x="0" y="174" fill="#9CA3AF" fontSize="10">₹0</text>

                {/* Dotted Gray Line (Last Week) */}
                <path
                  d="M 50 170 C 150 170, 250 160, 350 140 C 450 60, 520 40, 550 100 C 580 160, 650 170, 680 170"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Solid Gold Line (This Week) */}
                <path
                  d="M 50 170 C 150 170, 250 170, 350 165 C 450 100, 520 70, 550 130 C 580 170, 650 170, 680 170"
                  fill="none"
                  stroke="#B38548"
                  strokeWidth="2.5"
                />

                {/* Gold Data Point Dot */}
                <circle cx="520" cy="98" r="4" fill="#B38548" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="350" cy="165" r="3" fill="#B38548" />

                {/* X-Axis Date Labels */}
                <text x="50" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">18 Sep</text>
                <text x="155" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">19 Sep</text>
                <text x="260" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">20 Sep</text>
                <text x="365" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">21 Sep</text>
                <text x="470" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">22 Sep</text>
                <text x="575" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">23 Sep</text>
                <text x="680" y="195" fill="#9CA3AF" fontSize="11" textAnchor="middle">24 Sep</text>
              </svg>
            </div>

            {/* 4 Bottom Sub-Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-100">
              {/* Average Order Value */}
              <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 block">Average Order Value</span>
                  <span className="text-sm font-black text-neutral-900 mt-0.5 block">₹0</span>
                </div>
                <div className="p-2 bg-sky-100/60 text-sky-600 rounded-lg">
                  <BarChart2 className="w-4 h-4" />
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 block">Conversion Rate</span>
                  <span className="text-sm font-black text-neutral-900 mt-0.5 block">0%</span>
                </div>
                <div className="p-2 bg-purple-100/60 text-purple-600 rounded-lg">
                  <Star className="w-4 h-4" />
                </div>
              </div>

              {/* Returning Customers */}
              <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 block">Returning Customers</span>
                  <span className="text-sm font-black text-neutral-900 mt-0.5 block">0</span>
                </div>
                <div className="p-2 bg-emerald-100/60 text-emerald-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              {/* Total Visitors */}
              <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 block">Total Visitors</span>
                  <span className="text-sm font-black text-neutral-900 mt-0.5 block">{visitorCount}</span>
                </div>
                <div className="p-2 bg-indigo-100/60 text-indigo-600 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Top Selling Products</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Best performing products by sales</p>
              </div>

              <Link
                href="/dashboard/products"
                className="text-xs font-semibold text-[#B38548] hover:underline flex items-center space-x-1"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="border border-neutral-100 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50/80 text-neutral-500 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Sold</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-neutral-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-neutral-100/80 rounded-full text-neutral-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">No data available</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 Columns / ~35%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Store Health Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-amber-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="font-bold text-base text-neutral-900">Store Health</h3>
                </div>
                <p className="text-xs text-neutral-500">Overview of your store status</p>
              </div>

              {/* Donut Progress Circle Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-emerald-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="100, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[11px] font-black text-neutral-900 block leading-tight">100%</span>
                  <span className="text-[8px] font-medium text-emerald-600 block">Healthy</span>
                </div>
              </div>
            </div>

            {/* Health Status Rows */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-neutral-700">All Systems</span>
                </div>
                <span className="font-semibold text-emerald-600 text-[11px]">Operational</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-neutral-700">Payment Gateway</span>
                </div>
                <span className="font-semibold text-emerald-600 text-[11px]">Active</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-neutral-700">Shipping Services</span>
                </div>
                <span className="font-semibold text-emerald-600 text-[11px]">Active</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-neutral-700">Inventory Sync</span>
                </div>
                <span className="font-semibold text-emerald-600 text-[11px]">Up to date</span>
              </div>
            </div>
          </div>

          {/* Recent Storefront Orders Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Recent Storefront Orders</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Latest 5 orders from your store</p>
              </div>

              <Link
                href="/dashboard/orders"
                className="text-xs font-semibold text-[#B38548] hover:underline flex items-center space-x-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats?.recent_orders && stats.recent_orders.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recent_orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-neutral-50/80 rounded-xl border border-neutral-100 hover:bg-neutral-100/60 transition-colors text-xs"
                  >
                    <div>
                      <p className="font-bold text-neutral-900">{order.order_number}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-neutral-900">₹{order.total_amount.toLocaleString('en-IN')}</p>
                      <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-700">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-neutral-800">No orders yet</h4>
                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                  Orders will appear here once you start getting sales.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Add New Product */}
              <Link
                href="/dashboard/products/new"
                className="p-4 bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="p-3 bg-amber-100/70 text-amber-700 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Add New Product</span>
              </Link>

              {/* Manage Collections */}
              <Link
                href="/dashboard/collections"
                className="p-4 bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="p-3 bg-purple-100/70 text-purple-700 rounded-xl">
                  <Layers className="w-5 h-5 text-[#B38548]" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Manage Collections</span>
              </Link>

              {/* View Orders */}
              <Link
                href="/dashboard/orders"
                className="p-4 bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="p-3 bg-sky-100/70 text-sky-700 rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-800">View Orders</span>
              </Link>

              {/* Low Stock Items */}
              <Link
                href="/dashboard/inventory"
                className="p-4 bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="p-3 bg-orange-100/70 text-orange-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Low Stock Items</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
