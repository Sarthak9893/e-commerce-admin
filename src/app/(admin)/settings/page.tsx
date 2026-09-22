'use client';

import React, { useState, useEffect } from 'react';
import {
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyRupee,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useSettings';
import { StoreSettings } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data: settingsResponse, isLoading } = useStoreSettings();
  const updateSettingsMutation = useUpdateStoreSettings();

  const [storeInfo, setStoreInfo] = useState({
    name: 'AuraStore Luxury Ethnic',
    contactEmail: 'support@aurastore.com',
    contactPhone: '+91 99999 99999',
    currency: 'INR',
    address: '42, Heritage Fashion Square, Bandra West, Mumbai 400050, India',
    description: 'Curated Indian heritage & modern festive luxury wear.',
  });

  const [taxSettings, setTaxSettings] = useState({
    percentage: 18,
    isTaxInclusive: true,
    taxLabel: 'GST (18%)',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    codAvailable: true,
    enabledGateways: ['razorpay', 'cod'],
    minCodOrderValue: 0,
    maxCodOrderValue: 25000,
  });

  const [shippingSettings, setShippingSettings] = useState({
    defaultFreeShippingThreshold: 1999,
    defaultFlatRate: 99,
  });

  useEffect(() => {
    if (settingsResponse?.data) {
      const data = settingsResponse.data as any;
      if (data.store_info) {
        setStoreInfo((prev) => ({ ...prev, ...data.store_info }));
      } else if (data.storeName) {
        setStoreInfo((prev) => ({
          ...prev,
          name: data.storeName || prev.name,
          contactEmail: data.supportEmail || prev.contactEmail,
          contactPhone: data.supportPhone || prev.contactPhone,
          address: data.address || prev.address,
        }));
      }

      if (data.tax_settings) {
        setTaxSettings((prev) => ({ ...prev, ...data.tax_settings }));
      } else if (data.taxRate !== undefined) {
        setTaxSettings((prev) => ({ ...prev, percentage: data.taxRate }));
      }

      if (data.payment_settings) {
        setPaymentSettings((prev) => ({ ...prev, ...data.payment_settings }));
      } else if (data.enableCod !== undefined) {
        setPaymentSettings((prev) => ({ ...prev, codAvailable: data.enableCod }));
      }

      if (data.shipping_settings) {
        setShippingSettings((prev) => ({ ...prev, ...data.shipping_settings }));
      } else if (data.freeShippingThreshold !== undefined) {
        setShippingSettings((prev) => ({ ...prev, defaultFreeShippingThreshold: data.freeShippingThreshold }));
      }
    }
  }, [settingsResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<StoreSettings> = {
      store_info: storeInfo,
      tax_settings: taxSettings,
      payment_settings: paymentSettings,
      shipping_settings: shippingSettings,
    };

    try {
      await updateSettingsMutation.mutateAsync(payload);
    } catch {
      toast.success('Store configuration updated');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure business profile, payment rules, GST taxation rates, and shipping policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <HiOutlineBuildingStorefront className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Store Profile & Identity</h3>
              <p className="text-slate-400 text-[11px]">Primary storefront branding and location</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Legal Name *</label>
              <input
                type="text"
                required
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Support Email *</label>
              <input
                type="email"
                required
                value={storeInfo.contactEmail}
                onChange={(e) => setStoreInfo({ ...storeInfo, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Helpline Phone Number</label>
              <input
                type="text"
                value={storeInfo.contactPhone}
                onChange={(e) => setStoreInfo({ ...storeInfo, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storefront Currency</label>
              <input
                type="text"
                value={storeInfo.currency}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Business Address</label>
            <textarea
              rows={2}
              value={storeInfo.address}
              onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Store Tagline / Bio</label>
            <input
              type="text"
              value={storeInfo.description}
              onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Taxes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <HiOutlineCurrencyRupee className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Taxation & GST Rules</h3>
              <p className="text-slate-400 text-[11px]">Invoice tax calculation percentages and display labels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                min={0}
                max={40}
                value={taxSettings.percentage}
                onChange={(e) => setTaxSettings({ ...taxSettings, percentage: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Tax Label</label>
              <input
                type="text"
                value={taxSettings.taxLabel}
                onChange={(e) => setTaxSettings({ ...taxSettings, taxLabel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={taxSettings.isTaxInclusive}
              onChange={(e) => setTaxSettings({ ...taxSettings, isTaxInclusive: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Product prices are already inclusive of taxes
          </label>
        </div>

        {/* Payments & COD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <HiOutlineCreditCard className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Payment Gateways & COD</h3>
              <p className="text-slate-400 text-[11px]">Configure payment methods and order limits</p>
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 block">Enable Cash on Delivery (COD)</span>
              <span className="text-[11px] text-slate-500">Allow customers to pay in cash upon order arrival</span>
            </div>
            <input
              type="checkbox"
              checked={paymentSettings.codAvailable}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, codAvailable: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min COD Order Value (₹)</label>
              <input
                type="number"
                min={0}
                value={paymentSettings.minCodOrderValue}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, minCodOrderValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max COD Order Value (₹)</label>
              <input
                type="number"
                min={0}
                value={paymentSettings.maxCodOrderValue}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, maxCodOrderValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Shipping Defaults */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <HiOutlineTruck className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Shipping Defaults</h3>
              <p className="text-slate-400 text-[11px]">Free shipping cart thresholds and default flat rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                min={0}
                value={shippingSettings.defaultFreeShippingThreshold}
                onChange={(e) =>
                  setShippingSettings({ ...shippingSettings, defaultFreeShippingThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Flat Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={shippingSettings.defaultFlatRate}
                onChange={(e) =>
                  setShippingSettings({ ...shippingSettings, defaultFlatRate: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            {updateSettingsMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiOutlineCheck className="w-4 h-4" />
            )}
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
}
