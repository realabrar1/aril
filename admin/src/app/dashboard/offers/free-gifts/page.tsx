'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Plus, Edit, Trash2, CheckCircle2, XCircle, Sparkles, Save, PackageCheck, BarChart3, Settings } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface CampaignData {
  id: number;
  name: string;
  description?: string;
  min_order_amount: number;
  online_payment_eligible: boolean;
  cod_eligible_above_threshold: boolean;
  max_gifts_per_order: number;
  start_at?: string;
  end_at?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface AnalyticsData {
  total_gifts_claimed: number;
  remaining_stock: number;
  total_configured_gifts: number;
}

interface FreeGiftItemData {
  id: number;
  product_id: number;
  variant_id?: number;
  gift_title?: string;
  description?: string;
  display_image_url?: string;
  gift_stock: number;
  claimed_count: number;
  status: 'ACTIVE' | 'INACTIVE';
  product?: {
    id: number;
    name: string;
    base_price: number;
    images?: { image_url: string; is_primary: boolean }[];
  };
}

interface ProductOption {
  id: number;
  name: string;
  base_price: number;
}

export default function AdminFreeGiftsPage() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [giftItems, setGiftItems] = useState<FreeGiftItemData[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [giftTitle, setGiftTitle] = useState('');
  const [giftStock, setGiftStock] = useState(100);
  const [displayImage, setDisplayImage] = useState('');
  const [addingGift, setAddingGift] = useState(false);

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<FreeGiftItemData | null>(null);

  const fetchFreeGiftsData = async () => {
    setLoading(true);
    try {
      const [campRes, itemsRes, prodRes] = await Promise.all([
        apiClient<{ campaign: CampaignData; analytics: AnalyticsData }>('/admin/free-gifts/campaign'),
        apiClient<FreeGiftItemData[]>('/admin/free-gifts/items'),
        apiClient<{ data: ProductOption[] }>('/admin/products?per_page=100').catch(() => ({ success: false, data: { data: [] } })),
      ]);

      if (campRes.success && campRes.data) {
        setCampaign(campRes.data.campaign);
        setAnalytics(campRes.data.analytics);
      }

      if (itemsRes.success && itemsRes.data) {
        setGiftItems(itemsRes.data);
      }

      if (prodRes.success && prodRes.data) {
        const list = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.data || []);
        setAllProducts(list);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreeGiftsData();
  }, []);

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setSavingCampaign(true);
    setCampaignMsg(null);

    const res = await apiClient<CampaignData>('/admin/free-gifts/campaign', {
      method: 'PUT',
      body: JSON.stringify(campaign),
    });

    setSavingCampaign(false);
    if (res.success && res.data) {
      setCampaign(res.data);
      setCampaignMsg('Free gift offer rules updated successfully.');
      setTimeout(() => setCampaignMsg(null), 3000);
    }
  };

  const handleAddFreeGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setAddingGift(true);
    const res = await apiClient('/admin/free-gifts/items', {
      method: 'POST',
      body: JSON.stringify({
        product_id: selectedProductId,
        gift_title: giftTitle,
        gift_stock: giftStock,
        display_image_url: displayImage,
      }),
    });

    setAddingGift(false);
    if (res.success) {
      setShowAddModal(false);
      setSelectedProductId(null);
      setGiftTitle('');
      setGiftStock(100);
      setDisplayImage('');
      fetchFreeGiftsData();
    }
  };

  const handleUpdateItem = async (item: FreeGiftItemData) => {
    const res = await apiClient(`/admin/free-gifts/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        gift_title: item.gift_title,
        gift_stock: item.gift_stock,
        status: item.status,
      }),
    });
    if (res.success) {
      setEditingItem(null);
      fetchFreeGiftsData();
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to remove this product from Free Gifts?')) {
      const res = await apiClient(`/admin/free-gifts/items/${id}`, { method: 'DELETE' });
      if (res.success) fetchFreeGiftsData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#B38548]" />
            <h1 className="text-xl font-bold text-gray-900">Free Gift & Add-On Products CMS</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure order threshold rules (default ₹500), payment method eligibility, and available free gift products.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product as Free Gift</span>
        </button>
      </div>

      {/* Analytics Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Gifts Claimed</span>
            <span className="text-2xl font-black text-gray-900">{analytics?.total_gifts_claimed || 0}</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Remaining Gift Stock</span>
            <span className="text-2xl font-black text-emerald-600">{analytics?.remaining_stock || 0}</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Active Gift Options</span>
            <span className="text-2xl font-black text-blue-600">{giftItems.filter(i => i.status === 'ACTIVE').length}</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Campaign Settings Form */}
      {campaign && (
        <form onSubmit={handleSaveCampaign} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-[#B38548]" />
              <h2 className="font-bold text-sm text-gray-900">Campaign Rules Configuration</h2>
            </div>
            {campaignMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                {campaignMsg}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Campaign Title</label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Minimum Order Value Threshold (₹)</label>
              <input
                type="number"
                value={campaign.min_order_amount}
                onChange={(e) => setCampaign({ ...campaign, min_order_amount: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#B38548]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Campaign Status</label>
              <select
                value={campaign.status}
                onChange={(e) => setCampaign({ ...campaign, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
              >
                <option value="ACTIVE">ACTIVE (Offer Live)</option>
                <option value="INACTIVE">INACTIVE (Offer Disabled)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center space-x-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.online_payment_eligible}
                onChange={(e) => setCampaign({ ...campaign, online_payment_eligible: e.target.checked })}
                className="rounded text-[#B38548] focus:ring-[#B38548]"
              />
              <div>
                <span className="font-bold text-amber-900 block">UPI & Card Online Payments</span>
                <span className="text-[11px] text-amber-700">Eligible for free gift on all orders regardless of threshold</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.cod_eligible_above_threshold}
                onChange={(e) => setCampaign({ ...campaign, cod_eligible_above_threshold: e.target.checked })}
                className="rounded text-[#B38548] focus:ring-[#B38548]"
              />
              <div>
                <span className="font-bold text-gray-900 block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-gray-500">Eligible ONLY when merchandise subtotal ≥ ₹{campaign.min_order_amount}</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingCampaign}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B38548] hover:bg-[#966C32] text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingCampaign ? 'Saving Rules...' : 'Save Campaign Rules'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Free Gift Products List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-900">Eligible Free Gift Products ({giftItems.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading free gift items...</div>
        ) : giftItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No specific free gift products configured. Click "Add Product as Free Gift" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Product Image</th>
                  <th className="py-3.5 px-4">Gift Title / Product</th>
                  <th className="py-3.5 px-4">Gift Stock</th>
                  <th className="py-3.5 px-4">Claimed Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {giftItems.map((item) => {
                  const img = item.display_image_url || (item.product?.images?.[0]?.image_url ?? '/images/placeholder.jpg');
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{item.gift_title || item.product?.name}</div>
                        <div className="text-[11px] text-gray-400">Ref Product ID: #{item.product_id}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{item.gift_stock} units</td>
                      <td className="py-3 px-4 font-bold text-amber-700">{item.claimed_count} claimed</td>
                      <td className="py-3 px-4">
                        {item.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h2 className="text-base font-bold text-gray-900">Mark Product as Free Gift</h2>

            <form onSubmit={handleAddFreeGift} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Catalog Product *</label>
                <select
                  required
                  value={selectedProductId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedProductId(id);
                    const found = allProducts.find((p) => p.id === id);
                    if (found) setGiftTitle('Free Gift: ' + found.name);
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="">-- Choose Existing Product --</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} (Base: ₹{p.base_price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Display Title / Label</label>
                <input
                  type="text"
                  value={giftTitle}
                  onChange={(e) => setGiftTitle(e.target.value)}
                  placeholder="e.g. Free Earrings"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Gift Inventory Stock Limit *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={giftStock}
                  onChange={(e) => setGiftStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingGift}
                  className="px-4 py-2 bg-[#B38548] text-white font-bold rounded-xl hover:bg-[#966C32]"
                >
                  {addingGift ? 'Adding...' : 'Mark as Free Gift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h2 className="text-base font-bold text-gray-900">Edit Free Gift Item</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gift Display Title</label>
                <input
                  type="text"
                  value={editingItem.gift_title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, gift_title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Gift Stock Quantity</label>
                <input
                  type="number"
                  value={editingItem.gift_stock}
                  onChange={(e) => setEditingItem({ ...editingItem, gift_stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateItem(editingItem)}
                  className="px-4 py-2 bg-[#B38548] text-white font-bold rounded-xl hover:bg-[#966C32]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
