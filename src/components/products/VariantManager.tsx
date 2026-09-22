'use client';

import React from 'react';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineCube,
} from 'react-icons/hi2';
import { CreateVariantDto } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VariantManagerProps {
  variants: CreateVariantDto[];
  onChange: (variants: CreateVariantDto[]) => void;
  basePrice: number;
  baseSku?: string;
  disabled?: boolean;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const VariantManager: React.FC<VariantManagerProps> = ({
  variants,
  onChange,
  basePrice,
  baseSku = 'VAS-PROD',
  disabled = false,
}) => {
  const handleAddVariant = () => {
    const nextIndex = variants.length + 1;
    const cleanBaseSku = baseSku?.trim() || 'VAS-VAR';
    const newVariant: CreateVariantDto = {
      sku: `${cleanBaseSku}-V${nextIndex}`,
      size: 'M',
      color: 'Default',
      price: basePrice > 0 ? basePrice : 1999,
      stockQuantity: 20,
      isActive: true,
    };
    onChange([...variants, newVariant]);
  };

  const handleGenerateStandardSizes = () => {
    const cleanBaseSku = baseSku?.trim() || 'VAS-VAR';
    const defaultColor = variants[0]?.color || 'Navy Blue';
    const priceToUse = basePrice > 0 ? basePrice : 1999;

    const generated: CreateVariantDto[] = STANDARD_SIZES.map((size) => ({
      sku: `${cleanBaseSku}-${size}`,
      size,
      color: defaultColor,
      price: priceToUse,
      stockQuantity: 25,
      isActive: true,
    }));

    onChange(generated);
    toast.success(`Generated ${STANDARD_SIZES.length} standard size variants`);
  };

  const handleUpdateField = <K extends keyof CreateVariantDto>(
    index: number,
    field: K,
    value: CreateVariantDto[K]
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error('At least one variant is required for this product');
      return;
    }
    const updated = [...variants];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <HiOutlineCube className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Product Variants & Stock ({variants.length})
            </h4>
            <p className="text-[11px] text-slate-400">
              Configure inventory sizes, colors, variant pricing, and SKUs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateStandardSizes}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Auto-generate S, M, L, XL, XXL variants"
          >
            <HiOutlineSparkles className="w-3.5 h-3.5 text-indigo-600" />
            Standard Sizes (S–XXL)
          </button>

          <button
            type="button"
            onClick={handleAddVariant}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Add Variant
          </button>
        </div>
      </div>

      {/* Variants List / Table */}
      {variants.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50">
          <p className="text-xs text-slate-500 mb-2">No variants configured yet.</p>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50"
          >
            + Add First Variant
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Variant #{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={v.isActive ?? true}
                      onChange={(e) => handleUpdateField(idx, 'isActive', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Active
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    disabled={variants.length <= 1 || disabled}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title={variants.length <= 1 ? 'At least one variant required' : 'Remove variant'}
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                {/* Size */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Size
                  </label>
                  <input
                    type="text"
                    value={v.size || ''}
                    onChange={(e) => handleUpdateField(idx, 'size', e.target.value)}
                    placeholder="M / 42"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Color */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Color
                  </label>
                  <input
                    type="text"
                    value={v.color || ''}
                    onChange={(e) => handleUpdateField(idx, 'color', e.target.value)}
                    placeholder="Navy Blue"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* SKU */}
                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Variant SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={v.sku}
                    onChange={(e) => handleUpdateField(idx, 'sku', e.target.value)}
                    placeholder="VAS-PROD-M"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Price */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step={0.01}
                    value={v.price}
                    onChange={(e) => handleUpdateField(idx, 'price', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={v.stockQuantity ?? 0}
                    onChange={(e) => handleUpdateField(idx, 'stockQuantity', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
