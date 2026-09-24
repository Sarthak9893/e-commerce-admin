'use client';

import React, { useState, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineFilm,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowsUpDown,
  HiOutlineLink,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Pagination } from '@/components/common/Pagination';
import {
  useReels,
  useCreateReel,
  useUpdateReel,
  useDeleteReel,
} from '@/hooks/useReels';
import { Reel, CreateReelDto, ReelFilterParams } from '@/types';
import toast from 'react-hot-toast';

export default function ReelsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [deleteReelId, setDeleteReelId] = useState<string | null>(null);

  // Filters & Pagination
  const [filters, setFilters] = useState<ReelFilterParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<CreateReelDto>({
    title: '',
    reelUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  const { data: reelsResponse, isLoading } = useReels(filters);
  const createMutation = useCreateReel();
  const updateMutation = useUpdateReel();
  const deleteMutation = useDeleteReel();

  // Extract reels from response (handle both flat and nested data shapes)
  const rawData = reelsResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items);
  const reels: Reel[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  // Pagination metadata
  const meta = reelsResponse?.meta || (rawData as any)?.meta;
  const totalPages = meta?.totalPages || Math.ceil((meta?.total || reels.length) / (filters.limit || 20));

  // Stats
  const stats = useMemo(() => {
    return {
      total: meta?.total ?? reels.length,
      active: reels.filter((r) => r.isActive).length,
      inactive: reels.filter((r) => !r.isActive).length,
    };
  }, [reels, meta]);

  const handleSearch = () => {
    setFilters((prev) => {
      const trimmed = searchInput.trim();
      const updated = { ...prev, page: 1 };
      if (trimmed) {
        updated.search = trimmed;
      } else {
        delete updated.search;
      }
      return updated;
    });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setFilters((prev) => {
      const updated = { ...prev, page: 1 };
      delete updated.search;
      return updated;
    });
  };

  const handleOpenCreate = () => {
    setEditingReel(null);
    setFormData({
      title: '',
      reelUrl: '',
      sortOrder: reels.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Reel) => {
    setEditingReel(r);
    setFormData({
      title: r.title,
      reelUrl: r.reelUrl,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a reel title');
      return;
    }
    if (!formData.reelUrl.trim()) {
      toast.error('Please enter an Instagram reel URL');
      return;
    }

    try {
      if (editingReel) {
        await updateMutation.mutateAsync({
          id: editingReel.id,
          dto: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch {
      // Error toast already handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deleteReelId) return;
    try {
      await deleteMutation.mutateAsync(deleteReelId);
    } catch {
      // Error toast already handled in hook
    }
    setDeleteReelId(null);
  };

  const handleToggleActive = async (reel: Reel) => {
    try {
      await updateMutation.mutateAsync({
        id: reel.id,
        dto: { isActive: !reel.isActive },
      });
    } catch {
      // Error toast already handled in hook
    }
  };

  // Extract Instagram reel ID for thumbnail
  const getInstagramReelId = (url: string): string | null => {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Instagram Reels</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Instagram reels displayed on your storefront
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Reel
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <HiOutlineFilm className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-[11px] text-slate-500 font-medium">Total Reels</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <HiOutlineEye className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-[11px] text-slate-500 font-medium">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <HiOutlineEyeSlash className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
              <p className="text-[11px] text-slate-500 font-medium">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search reels by title..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <HiOutlineXMark className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <HiOutlineFunnel className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={filters.isActive === undefined ? '' : String(filters.isActive)}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      page: 1,
                      isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sort By</label>
                <select
                  value={filters.sortBy || 'sortOrder'}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="sortOrder">Sort Order</option>
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Direction</label>
                <select
                  value={filters.sortOrder || 'ASC'}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortOrder: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
            </div>

            {(filters.isActive !== undefined || filters.sortBy || filters.sortOrder) && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      page: 1,
                      limit: 20,
                      search: searchInput.trim() || undefined,
                    })
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reels Table/List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-xs text-slate-500 font-medium">Loading reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <EmptyState
          title="No reels found"
          description={filters.search ? 'Try a different search term.' : 'Add your first Instagram reel to showcase on the storefront.'}
          actionLabel="Add Reel"
          onAction={handleOpenCreate}
          icon={HiOutlineFilm}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1">
                      <HiOutlineArrowsUpDown className="w-3 h-3 text-slate-400" />
                      Order
                    </div>
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Title
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Reel URL
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Created
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reels.map((reel) => {
                  const reelId = getInstagramReelId(reel.reelUrl);
                  return (
                    <tr
                      key={reel.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Sort Order */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                          {reel.sortOrder}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
                            <HiOutlineFilm className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{reel.title}</p>
                            {reelId && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {reelId}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* URL */}
                      <td className="px-5 py-3.5">
                        <a
                          href={reel.reelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors max-w-xs truncate"
                        >
                          <HiOutlineLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{reel.reelUrl}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(reel)}
                          disabled={updateMutation.isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all hover:scale-105 ${
                            reel.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              reel.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {reel.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 text-center text-slate-500">
                        {reel.createdAt
                          ? new Date(reel.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(reel)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit reel"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteReelId(reel.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete reel"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <Pagination
                page={filters.page || 1}
                totalPages={totalPages}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center">
                  <HiOutlineFilm className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingReel ? 'Edit Reel' : 'Add Instagram Reel'}
                </h3>
              </div>
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
                <label className="block font-semibold text-slate-700 mb-1">Reel Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Collection Lookbook"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instagram Reel URL *</label>
                <input
                  type="url"
                  required
                  value={formData.reelUrl}
                  onChange={(e) => setFormData({ ...formData, reelUrl: e.target.value })}
                  placeholder="https://www.instagram.com/reel/ABC123/"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Paste the full Instagram reel URL
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="reelActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="reelActive" className="font-medium text-slate-700 cursor-pointer">
                      Active on storefront
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {formData.reelUrl && getInstagramReelId(formData.reelUrl) && (
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center shrink-0">
                      <HiOutlineFilm className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-xs truncate">{formData.title || 'Untitled Reel'}</p>
                      <a
                        href={formData.reelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 truncate block"
                      >
                        {formData.reelUrl}
                      </a>
                    </div>
                  </div>
                </div>
              )}

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
                  {editingReel ? 'Save Changes' : 'Add Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteReelId}
        onClose={() => setDeleteReelId(null)}
        onConfirm={handleDelete}
        title="Delete Reel"
        message="Are you sure you want to permanently remove this reel? This action cannot be undone."
        confirmText="Delete Reel"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
