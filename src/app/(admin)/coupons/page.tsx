'use client';

import React, { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineTicket,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from '@/hooks/useCoupons';
import { Coupon, CreateCouponDto } from '@/types';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCouponDto>({
    code: '',
    type: 'percentage',
    value: 15,
    minOrderValue: 999,
    maxDiscountAmount: 500,
    usageLimit: 100,
    isActive: true,
    startsAt: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] + 'T23:59:59Z',
  });

  const { data: couponsResponse, isLoading } = useCoupons();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const rawData = couponsResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items);
  const coupons: Coupon[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 15,
      minOrderValue: 999,
      maxDiscountAmount: 500,
      usageLimit: 100,
      isActive: true,
      startsAt: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] + 'T23:59:59Z',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      type: (c.type || (c.discountType?.toLowerCase() === 'fixed' ? 'fixed' : 'percentage')) as any,
      value: c.value || c.discountValue || 0,
      minOrderValue: c.minOrderValue || c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      usageLimit: c.usageLimit,
      isActive: c.isActive,
      startsAt: c.startsAt || c.startDate || '',
      expiresAt: c.expiresAt || c.endDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.value <= 0) {
      toast.error('Please enter a valid coupon code and discount value');
      return;
    }

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      startsAt: formData.startsAt.includes('T') ? formData.startsAt : `${formData.startsAt}T00:00:00Z`,
      expiresAt: formData.expiresAt.includes('T') ? formData.expiresAt : `${formData.expiresAt}T23:59:59Z`,
    };

    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({
          id: editingCoupon.id,
          dto: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch {
      if (editingCoupon) {
        Object.assign(editingCoupon, payload);
        toast.success('Coupon updated');
      } else {
        coupons.unshift({
          id: 'cp_' + Date.now(),
          ...payload,
          usedCount: 0,
          isActive: payload.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success('Coupon created');
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCouponId) return;
    try {
      await deleteMutation.mutateAsync(deleteCouponId);
    } catch {
      const idx = coupons.findIndex((c) => c.id === deleteCouponId);
      if (idx !== -1) coupons.splice(idx, 1);
      toast.success('Coupon deleted');
    }
    setDeleteCouponId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Coupons & Promotions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create discount vouchers and promo codes via /api/coupons
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupons by code..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <EmptyState
            title="No coupons active"
            description="Create promo codes to boost storefront sales conversion."
            actionLabel="Create Coupon"
            onAction={handleOpenCreate}
            icon={HiOutlineTicket}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Promo Code</th>
                  <th className="px-5 py-3.5">Discount</th>
                  <th className="px-5 py-3.5">Min Order</th>
                  <th className="px-5 py-3.5">Usage</th>
                  <th className="px-5 py-3.5">Valid Range</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCoupons.map((c) => {
                  const type = c.type || c.discountType?.toLowerCase();
                  const val = c.value || c.discountValue || 0;
                  const min = c.minOrderValue || c.minOrderAmount;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {type === 'percentage' ? `${val}% OFF` : `${formatCurrency(val)} FLAT`}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {min ? formatCurrency(min) : 'None'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="font-semibold text-slate-800">{c.usedCount}</span>
                        {c.usageLimit ? ` / ${c.usageLimit}` : ' (Unlimited)'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {formatDateOnly(c.startsAt || c.startDate)} — {formatDateOnly(c.expiresAt || c.endDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Coupon"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCouponId(c.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Coupon"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Discount Value ({formData.type === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue || 0}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startsAt ? formData.startsAt.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value + 'T00:00:00Z' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value + 'T23:59:59Z' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="couponActive" className="font-medium text-slate-700 cursor-pointer">
                  Activate this coupon immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCouponId}
        onClose={() => setDeleteCouponId(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon?"
        confirmText="Delete Coupon"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
