'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlinePhoto,
  HiOutlineCloudArrowUp,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from '@/hooks/useBanners';
import { Banner, CreateBannerDto } from '@/types';
import toast from 'react-hot-toast';

export default function BannersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateBannerDto>({
    title: '',
    linkUrl: '',
    position: 'homepage_hero',
    isActive: true,
    sortOrder: 1,
  });

  const { data: bannersResponse, isLoading } = useBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const rawData = bannersResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items);
  const banners: Banner[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  const resetForm = () => {
    setFormData({
      title: '',
      linkUrl: '/collections',
      position: 'homepage_hero',
      isActive: true,
      sortOrder: banners.length + 1,
    });
    setImagePreview(null);
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      linkUrl: b.linkUrl || '',
      position: b.position,
      isActive: b.isActive,
      sortOrder: b.sortOrder || 0,
    });
    setImagePreview(b.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5 MB');
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please enter banner title');
      return;
    }
    if (!editingBanner && !formData.image) {
      toast.error('Please upload a banner image');
      return;
    }

    try {
      if (editingBanner) {
        await updateMutation.mutateAsync({
          id: editingBanner.id,
          dto: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch {
      // error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deleteBannerId) return;
    try {
      await deleteMutation.mutateAsync(deleteBannerId);
    } catch {
      // error handled in hook
    }
    setDeleteBannerId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Storefront Banners</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage homepage sliders and promotional strips via /api/banners/admin
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <EmptyState
          title="No banners created"
          description="Create your first hero banner for the storefront."
          actionLabel="Add Banner"
          onAction={handleOpenCreate}
          icon={HiOutlinePhoto}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => {
            const img = b.imageUrl;
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
                  {img ? (
                    <img
                      src={img}
                      alt={b.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">No image provided</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider mb-2 w-fit">
                      {b.position.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-white text-base">{b.title}</h3>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
                  <div className="text-xs text-slate-500 truncate max-w-xs">
                    <span>Link: <strong className="text-slate-700 font-mono">{b.linkUrl || '—'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        b.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          b.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {b.isActive ? 'Active' : 'Disabled'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteBannerId(b.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Festive Silk Showcase 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Banner Image {!editingBanner && '*'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="banner-image-upload"
                />

                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-[11px] font-semibold bg-white text-slate-800 rounded-lg shadow-md hover:bg-slate-50 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 text-[11px] font-semibold bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {formData.image && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md backdrop-blur-sm">
                        {formData.image.name} · {(formData.image.size / 1024).toFixed(0)} KB
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <HiOutlineCloudArrowUp className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-700 font-semibold text-xs">
                        {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        JPEG, PNG, or WebP · Max 5 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placement Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value as CreateBannerDto['position'] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="homepage_hero">Homepage Hero</option>
                    <option value="category_top">Category Top</option>
                    <option value="promo_strip">Promo Strip</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Priority</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Target Link</label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/collections/festive"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="banActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="banActive" className="font-medium text-slate-700 cursor-pointer">
                  Activate banner on storefront
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
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteBannerId}
        onClose={() => setDeleteBannerId(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure you want to remove this banner?"
        confirmText="Delete Banner"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
