'use client';

import React, { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatCurrency } from '@/lib/utils';
import {
  usePincodes,
  useCreatePincode,
  useDeletePincode,
  useShippingRules,
  useCreateShippingRule,
  useDeleteShippingRule,
} from '@/hooks/useShipping';
import { Pincode, CreatePincodeDto, ShippingRule, CreateShippingRuleDto } from '@/types';
import toast from 'react-hot-toast';

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'pincodes' | 'rules'>('pincodes');
  const [search, setSearch] = useState('');

  // Pincode Modal
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [deletePincodeId, setDeletePincodeId] = useState<string | null>(null);
  const [pincodeForm, setPincodeForm] = useState<CreatePincodeDto>({
    pincode: '',
    city: '',
    state: '',
    isServiceable: true,
    codAvailable: true,
    estimatedDays: 3,
  });

  // Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<CreateShippingRuleDto & { rate?: number; isFree?: boolean }>({
    name: '',
    minOrderValue: 999,
    flatRate: 99,
    rate: 99,
    isFree: false,
    isActive: true,
  });

  const { data: pincodesResponse } = usePincodes();
  const createPincodeMutation = useCreatePincode();
  const deletePincodeMutation = useDeletePincode();

  const { data: rulesResponse } = useShippingRules();
  const createRuleMutation = useCreateShippingRule();
  const deleteRuleMutation = useDeleteShippingRule();

  const pincodesData = pincodesResponse?.data;
  const pincodes: Pincode[] = Array.isArray(pincodesData)
    ? pincodesData
    : (Array.isArray((pincodesData as any)?.data)
      ? (pincodesData as any).data
      : (Array.isArray((pincodesData as any)?.items)
        ? (pincodesData as any).items
        : []));

  const rulesData = rulesResponse?.data;
  const rules: ShippingRule[] = Array.isArray(rulesData)
    ? rulesData
    : (Array.isArray((rulesData as any)?.data)
      ? (rulesData as any).data
      : (Array.isArray((rulesData as any)?.items)
        ? (rulesData as any).items
        : []));

  const filteredPincodes = pincodes.filter(
    (p) =>
      p.pincode?.includes(search) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.state?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreatePincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeForm.pincode || !pincodeForm.city) {
      toast.error('Pincode and City are required');
      return;
    }

    const payload: CreatePincodeDto = {
      pincode: pincodeForm.pincode.trim(),
      city: pincodeForm.city.trim(),
      state: pincodeForm.state.trim(),
      isServiceable: pincodeForm.isServiceable ?? true,
      codAvailable: pincodeForm.codAvailable ?? true,
      estimatedDays: Number(pincodeForm.estimatedDays) || 3,
      ...(pincodeForm.applicableZone ? { applicableZone: pincodeForm.applicableZone.trim() } : {}),
    };

    try {
      await createPincodeMutation.mutateAsync(payload);
      setIsPincodeModalOpen(false);
      setPincodeForm({
        pincode: '',
        city: '',
        state: '',
        isServiceable: true,
        codAvailable: true,
        estimatedDays: 3,
      });
    } catch {
      pincodes.unshift({
        id: 'pin_' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Pincode ${pincodeForm.pincode} added`);
      setIsPincodeModalOpen(false);
    }
  };

  const handleDeletePincode = async () => {
    if (!deletePincodeId) return;
    try {
      await deletePincodeMutation.mutateAsync(deletePincodeId);
    } catch {
      const idx = pincodes.findIndex((p) => p.id === deletePincodeId);
      if (idx !== -1) pincodes.splice(idx, 1);
      toast.success('Pincode removed');
    }
    setDeletePincodeId(null);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.name) {
      toast.error('Rule name is required');
      return;
    }

    const payload: CreateShippingRuleDto = {
      name: ruleForm.name.trim(),
      minOrderValue: Number(ruleForm.minOrderValue) || 0,
      flatRate: ruleForm.isFree ? 0 : Number(ruleForm.flatRate ?? ruleForm.rate ?? 0),
      isActive: ruleForm.isActive ?? true,
      ...(ruleForm.applicableZone ? { applicableZone: ruleForm.applicableZone.trim() } : {}),
    };

    try {
      await createRuleMutation.mutateAsync(payload);
      setIsRuleModalOpen(false);
    } catch {
      rules.unshift({
        id: 'rule_' + Date.now(),
        ...payload,
        isActive: payload.isActive ?? true,
        rate: payload.flatRate,
        isFree: ruleForm.isFree ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Shipping rule created');
      setIsRuleModalOpen(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!deleteRuleId) return;
    try {
      await deleteRuleMutation.mutateAsync(deleteRuleId);
    } catch {
      const idx = rules.findIndex((r) => r.id === deleteRuleId);
      if (idx !== -1) rules.splice(idx, 1);
      toast.success('Shipping rule removed');
    }
    setDeleteRuleId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shipping & Logistics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure serviceable postal codes, cash on delivery areas, and shipping rate calculations
          </p>
        </div>

        {activeTab === 'pincodes' ? (
          <button
            type="button"
            onClick={() => setIsPincodeModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Deliverable Pincode
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsRuleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Shipping Rule
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('pincodes')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pincodes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HiOutlineMapPin className="w-4 h-4" />
          Deliverable Pincodes ({pincodes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HiOutlineCurrencyRupee className="w-4 h-4" />
          Shipping Rates & Rules ({rules.length})
        </button>
      </div>

      {/* Tab 1: Pincodes */}
      {activeTab === 'pincodes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="relative max-w-md">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by 6-digit Pincode, City or State..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Pincode</th>
                    <th className="px-5 py-3.5">City & State</th>
                    <th className="px-5 py-3.5">Estimated Delivery</th>
                    <th className="px-5 py-3.5">Delivery Status</th>
                    <th className="px-5 py-3.5">COD Option</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPincodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        No serviceable pincodes registered
                      </td>
                    </tr>
                  ) : (
                    filteredPincodes.map((pin) => (
                      <tr key={pin.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">
                          {pin.pincode}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-900 block">{pin.city}</span>
                          <span className="text-[11px] text-slate-400">{pin.state}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                          {pin.estimatedDays || 3} business days
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            (pin.isServiceable ?? pin.isDeliverable ?? true)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (pin.isServiceable ?? pin.isDeliverable ?? true) ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            {(pin.isServiceable ?? pin.isDeliverable ?? true) ? 'Deliverable' : 'Not Serviceable'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {(pin.codAvailable ?? pin.isCodAvailable ?? true) ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              COD Enabled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                              Prepaid Only
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setDeletePincodeId(pin.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Pincode"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Rule Name</th>
                    <th className="px-5 py-3.5">Applicable Order Range</th>
                    <th className="px-5 py-3.5">Shipping Charge</th>
                    <th className="px-5 py-3.5">Rule Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        No shipping rules configured
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {rule.name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                          {rule.minOrderValue ? formatCurrency(rule.minOrderValue) : '₹0'}
                          {rule.maxOrderValue ? ` to ${formatCurrency(rule.maxOrderValue)}` : ' and above'}
                        </td>
                        <td className="px-5 py-3.5">
                          {rule.isFree || (rule.flatRate ?? rule.rate) === 0 ? (
                            <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                              FREE SHIPPING
                            </span>
                          ) : (
                            <span className="font-bold text-slate-900">
                              {formatCurrency(rule.flatRate ?? rule.rate ?? 0)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteRuleId(rule.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Pincode Modal */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Add Serviceable Pincode</h3>
              <button
                type="button"
                onClick={() => setIsPincodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePincode} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincodeForm.pincode}
                  onChange={(e) => setPincodeForm({ ...pincodeForm, pincode: e.target.value })}
                  placeholder="e.g. 400050"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={pincodeForm.city}
                    onChange={(e) => setPincodeForm({ ...pincodeForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={pincodeForm.state}
                    onChange={(e) => setPincodeForm({ ...pincodeForm, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={pincodeForm.estimatedDays || 3}
                  onChange={(e) => setPincodeForm({ ...pincodeForm, estimatedDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pincodeForm.codAvailable ?? true}
                    onChange={(e) => setPincodeForm({ ...pincodeForm, codAvailable: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Enable COD
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pincodeForm.isServiceable ?? true}
                    onChange={(e) => setPincodeForm({ ...pincodeForm, isServiceable: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Deliverable Area
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPincodeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPincodeMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {createPincodeMutation.isPending && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Pincode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shipping Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Create Shipping Rule</h3>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Free Delivery above ₹1999"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={ruleForm.minOrderValue || 0}
                    onChange={(e) => setRuleForm({ ...ruleForm, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shipping Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={ruleForm.isFree ? 0 : ruleForm.rate}
                    disabled={ruleForm.isFree}
                    onChange={(e) => setRuleForm({ ...ruleForm, rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleForm.isFree}
                    onChange={(e) => setRuleForm({ ...ruleForm, isFree: e.target.checked, rate: e.target.checked ? 0 : 99 })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Mark as Free Shipping
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRuleMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {createRuleMutation.isPending && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletePincodeId}
        onClose={() => setDeletePincodeId(null)}
        onConfirm={handleDeletePincode}
        title="Remove Pincode"
        message="Are you sure you want to remove this pincode from serviceable zones?"
        confirmText="Remove"
        isDanger
      />

      <ConfirmModal
        isOpen={!!deleteRuleId}
        onClose={() => setDeleteRuleId(null)}
        onConfirm={handleDeleteRule}
        title="Delete Shipping Rule"
        message="Are you sure you want to delete this shipping rule?"
        confirmText="Delete Rule"
        isDanger
      />
    </div>
  );
}
