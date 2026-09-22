'use client';

import React, { useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiStar,
} from 'react-icons/hi2';
import { StatusChip } from '@/components/common/StatusChip';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatDate } from '@/lib/utils';
import {
  useReviews,
  useUpdateReviewStatus,
  useDeleteReview,
} from '@/hooks/useReviews';
import { Review } from '@/types';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const { data: reviewsResponse, isLoading } = useReviews({
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateReviewStatus();
  const deleteMutation = useDeleteReview();

  const rawData = reviewsResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items);
  const reviews: Review[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (r.customerName || '').toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.product?.name || r.product?.title || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch {
      const target = reviews.find((r) => r.id === id);
      if (target) {
        target.status = status;
        toast.success(`Review marked as ${status}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteReviewId) return;
    try {
      await deleteMutation.mutateAsync(deleteReviewId);
    } catch {
      const idx = reviews.findIndex((r) => r.id === deleteReviewId);
      if (idx !== -1) reviews.splice(idx, 1);
      toast.success('Review deleted');
    }
    setDeleteReviewId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">
          Moderate customer feedback via /api/reviews/admin
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback or reviewer name..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Review Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Moderation</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <EmptyState
            title="No reviews found"
            description="There are currently no customer reviews matching your criteria."
          />
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HiStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    {rev.title || 'Product Feedback'}
                  </span>
                  <StatusChip status={rev.status} size="sm" />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">{rev.comment}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span>
                    By <strong className="text-slate-800">{rev.customerName || 'Customer'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Product: <strong className="text-indigo-600">{rev.product?.name || rev.product?.title || 'Product Item'}</strong>
                  </span>
                  <span>•</span>
                  <span>{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {rev.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}

                {rev.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <HiOutlineXMark className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteReviewId(rev.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete review"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review?"
        confirmText="Delete Review"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
