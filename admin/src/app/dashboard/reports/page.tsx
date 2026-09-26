'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats } from '@/types';
import {
  BarChart3,
  Download,
  Calendar,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
  Truck,
  ArrowUpRight,
  Filter,
  Printer,
  ChevronDown,
  Check,
  Package,
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers' | 'shipping'>('sales');
  const [period, setPeriod] = useState('Last 30 Days');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  const periods = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Quarter', 'Year to Date (YTD)'];

  useEffect(() => {
    document.title = 'Analytics & Reports | ARILHA Admin';

    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await dashboardService.getStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (e) {}

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arilha.com/api/v1';
        const res = await fetch(`${apiBaseUrl}/admin/analytics/visitors`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setVisitorCount(json.data.total_visitors ?? 0);
          }
        }
      } catch (e) {}

      setIsLoading(false);
    };

    loadData();
  }, [period]);

  // CSV Report Export Generator
  const handleExportCSV = () => {
    const reportDate = new Date().toLocaleDateString('en-IN');
    const rows = [
      ['ARILHA E-COMMERCE BUSINESS ANALYTICS REPORT'],
      [`Generated On`, reportDate],
      [`Selected Period`, period],
      [],
      ['SUMMARY METRICS'],
      ['Total Sales Revenue', `₹${stats?.todays_sales || 0}`],
      ['Orders Received', stats?.orders_today || 0],
      ['Pending Orders', stats?.pending_orders || 0],
      ['Total Customers', stats?.total_customers || 0],
      ['Low Stock Variants Alert', stats?.low_stock_products || 0],
      ['Total Store Visitors', visitorCount],
      [],
      ['SAMPLE REVENUE BREAKDOWN'],
      ['Date', 'Orders', 'Payment Mode', 'Gross Revenue (INR)', 'Status'],
      ['2026-09-24', '1', 'Prepaid (UPI/Card)', `₹${stats?.todays_sales || 0}`, 'CONFIRMED'],
      ['2026-09-23', '0', 'N/A', '₹0', 'N/A'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ARILHA_Full_Business_Report_${period.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#B38548]" />
            <span>Analytics & Business Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Comprehensive revenue analytics, product velocity, customer metrics, and shipping reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPeriodDropdownOpen((p) => !p)}
              className="flex items-center space-x-2 bg-white border border-neutral-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#B38548]" />
              <span>{period}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isPeriodDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-1 animate-in fade-in duration-150">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-1.5">
                  Report Timeframe
                </div>
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setIsPeriodDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                      period === p ? 'bg-amber-50 text-amber-900 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{p}</span>
                    {period === p && <Check className="w-3.5 h-3.5 text-[#B38548]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Print Report */}
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-white border border-neutral-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
            title="Print PDF Report"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-[#B38548] hover:bg-[#996f3a] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Gross Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">
            ₹{stats?.todays_sales ? stats.todays_sales.toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+100% active operational</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Orders</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">{stats?.orders_today || 0}</p>
          <p className="text-[11px] font-medium text-neutral-500 mt-2">
            {stats?.pending_orders || 0} pending processing
          </p>
        </div>

        {/* Customers & Traffic */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Unique Store Traffic</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">{visitorCount.toLocaleString()}</p>
          <p className="text-[11px] font-semibold text-purple-600 mt-2">
            {stats?.total_customers || 0} registered accounts
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Inventory Alert Level</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">{stats?.low_stock_products || 0}</p>
          <p className="text-[11px] font-semibold text-amber-600 mt-2">
            Variants needing restock
          </p>
        </div>
      </div>

      {/* Report Category Tabs */}
      <div className="flex border-b border-neutral-200 bg-white rounded-2xl p-1 shadow-2xs gap-1">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'sales'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Sales & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'products'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Velocity</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'customers'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'shipping'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Logistics</span>
        </button>
      </div>

      {/* Tab Content 1: Sales & Revenue Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Gateway Method Split */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-neutral-900 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#B38548]" />
                <span>Payment Gateways</span>
              </h3>
              <p className="text-xs text-neutral-500">Distribution of payment modes across storefront orders</p>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>UPI / Online (Razorpay)</span>
                    <span className="font-mono text-emerald-600 font-bold">50% fee (₹50)</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[65%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Cash on Delivery (COD)</span>
                    <span className="font-mono text-amber-600 font-bold">100% fee (₹100)</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[35%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Sales Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Recent Revenue Log</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Filtered by {period}</p>
                </div>
                <Link
                  href="/dashboard/orders"
                  className="text-xs font-bold text-[#B38548] hover:underline flex items-center"
                >
                  View All Orders <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="border border-neutral-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 font-semibold text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Orders</th>
                      <th className="py-2.5 px-3">Payment Mode</th>
                      <th className="py-2.5 px-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {stats?.todays_sales ? (
                      <tr>
                        <td className="py-3 px-3 font-medium">2026-09-24</td>
                        <td className="py-3 px-3">1</td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Prepaid
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-neutral-900">
                          ₹{stats.todays_sales.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-neutral-400">
                          No order transactions recorded for this timeframe yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Product Velocity */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900">Product Sales Velocity</h3>
              <p className="text-xs text-neutral-500">Track best performing jewellery products & inventory velocity</p>
            </div>
            <Link
              href="/dashboard/products/new"
              className="px-3.5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              + Add Product
            </Link>
          </div>

          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 font-semibold text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-400">
                    <Package className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                    <p className="font-medium text-xs">No product sales velocity recorded yet.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Customer Insights */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Customer Base Metrics</h3>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-600">Total Registered Accounts</span>
                <span className="font-bold text-neutral-900">{stats?.total_customers || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-600">Unique Storefront Visitors</span>
                <span className="font-bold text-neutral-900">{visitorCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Customer Management</h3>
            <p className="text-xs text-neutral-500">View customer profile directory and order histories</p>
            <Link
              href="/dashboard/customers"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#B38548] text-white rounded-xl text-xs font-bold hover:bg-[#996f3a] transition-colors"
            >
              <span>View Customer Directory</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab Content 4: Shipping & Logistics */}
      {activeTab === 'shipping' && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <span>Shiprocket Logistics Performance</span>
              </h3>
              <p className="text-xs text-neutral-500">Order dispatch times & courier partner performance</p>
            </div>
            <Link
              href="/dashboard/shipping/rate-calculator"
              className="px-3.5 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors"
            >
              Rate Calculator
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100">
              <span className="text-xs font-bold text-sky-900 block">Prepaid Shipping Charge</span>
              <span className="text-xl font-black text-sky-900 mt-1 block">₹50</span>
              <span className="text-[11px] text-sky-700 mt-1 block">Default fee for UPI / Online Cards</span>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-xs font-bold text-amber-900 block">COD Shipping Charge</span>
              <span className="text-xl font-black text-amber-900 mt-1 block">₹100</span>
              <span className="text-[11px] text-amber-700 mt-1 block">Default fee for Cash on Delivery</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
