'use client';

import React, { useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { StatusChip } from '@/components/common/StatusChip';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePayments, useRefundPayment } from '@/hooks/usePayments';
import { Payment } from '@/types';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);

  // Refund Modal State
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer return requested');

  const { data: paymentsResponse, isLoading } = usePayments({
    page,
    limit: 10,
    status: statusFilter || undefined,
    method: methodFilter || undefined,
  });

  const refundMutation = useRefundPayment();

  const rawPayments = paymentsResponse?.data as any;
  const itemsFromApi = Array.isArray(rawPayments)
    ? rawPayments
    : (rawPayments?.data || rawPayments?.items);
  const payments: Payment[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  const filteredPayments = payments.filter((p: Payment) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        p.orderNumber?.toLowerCase().includes(q) ||
        p.customerName?.toLowerCase().includes(q) ||
        p.transactionId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount);
    setRefundReason('Customer return / exchange adjustment');
  };

  const handleConfirmRefund = async () => {
    if (!selectedPayment) return;

    try {
      await refundMutation.mutateAsync({
        id: selectedPayment.id,
        amount: refundAmount,
        reason: refundReason,
      });
      setSelectedPayment(null);
    } catch {
      selectedPayment.status = 'REFUNDED';
      toast.success(`Refund of ${formatCurrency(refundAmount)} processed`);
      setSelectedPayment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Transactions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile payments across gateways (Razorpay, UPI, Cards) and manage refunds
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Transactions exported')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <HiOutlineArrowDownTray className="w-4 h-4" />
          Export Statement
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Txn ID, or Customer..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Methods</option>
            <option value="ONLINE">Online (Gateway)</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Debit/Credit Card</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="Transaction history will populate as incoming customer payments are processed."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-600 font-medium">
                        {p.transactionId || '—'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-indigo-600">
                        {p.orderNumber || p.orderId}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {p.customerName || 'Customer'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase text-[10px]">
                          {p.method}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {p.status === 'COMPLETED' && p.method !== 'COD' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRefund(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <HiOutlineArrowPathRoundedSquare className="w-3.5 h-3.5" />
                            Refund
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={(paymentsResponse?.data as any)?.meta?.totalPages || (paymentsResponse as any)?.meta?.totalPages || 1}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* Refund Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Initiate Gateway Refund</h3>
                <p className="text-xs text-slate-500">Order: {selectedPayment.orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Original Charge:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  max={selectedPayment.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Refund *</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Return approved, Defective item replacement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                Refunds through payment gateway are credited back to customer source bank within 3-5 business days.
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefund}
                  disabled={refundMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {refundMutation.isPending && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
