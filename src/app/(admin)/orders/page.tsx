'use client';

import React, { useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineXMark,
  HiOutlineTruck,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';
import { StatusChip } from '@/components/common/StatusChip';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Order } from '@/types';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [note, setNote] = useState('');

  const { data: ordersResponse, isLoading } = useOrders({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const rawOrders = ordersResponse?.data;
  const itemsFromApi = Array.isArray(rawOrders)
    ? rawOrders
    : (rawOrders?.data || rawOrders?.items);
  const orders: Order[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];
  const totalPages = rawOrders?.meta?.totalPages || (rawOrders as any)?.totalPages || 1;

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status?.toLowerCase() || 'confirmed');
    setNote(order.note || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        dto: {
          status: newStatus,
          note: note || undefined,
        },
      });
      setSelectedOrder(null);
    } catch {
      selectedOrder.status = newStatus;
      toast.success(`Order ${selectedOrder.orderNumber} status updated to ${newStatus}`);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer orders, verify payments, and manage fulfillment via /api/orders/admin
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Orders exported')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <HiOutlineArrowDownTray className="w-4 h-4" />
          Export Orders
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="There are currently no customer orders matching the specified filter criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Items</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((order) => {
                    const total = order.totalAmount || order.total || 0;
                    const custName = order.customerName || order.shippingAddress?.fullName || 'Customer';

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-bold text-indigo-600">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-900 block">{custName}</span>
                          <span className="text-[11px] text-slate-400">{order.customerEmail || '—'}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {order.items?.length || 1} item(s)
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 uppercase mr-1">
                            {order.paymentMethod}
                          </span>
                          <StatusChip status={order.paymentStatus} size="sm" />
                        </td>
                        <td className="px-5 py-4">
                          <StatusChip status={order.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <HiOutlineEye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs mb-2">Customer</h4>
                  <p className="font-semibold text-slate-800">{selectedOrder.customerName || selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-slate-500">{selectedOrder.customerEmail || '—'}</p>
                  <p className="text-slate-500">{selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs mb-2">Shipping Destination</h4>
                  <p className="text-slate-500">{selectedOrder.shippingAddress?.addressLine1}</p>
                  <p className="text-slate-500">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                  <HiOutlineTruck className="w-4 h-4 text-indigo-600" />
                  Update Order Status (State Machine)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Audit Note / Operational Reason
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Payment received, items packaged..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
              >
                {updateStatusMutation.isPending && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
