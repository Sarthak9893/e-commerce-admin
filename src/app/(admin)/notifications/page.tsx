'use client';

import React, { useState } from 'react';
import {
  HiOutlineEnvelope,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { formatDate } from '@/lib/utils';
import { useNotificationLogs } from '@/hooks/useNotifications';
import { NotificationLog } from '@/types';

export default function NotificationsPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  const { data: logsResponse, isLoading } = useNotificationLogs({
    page,
    limit: 15,
    recipientEmail: searchEmail || undefined,
    type: selectedType || undefined,
    status: selectedStatus || undefined,
  });

  const rawData = logsResponse?.data as any;
  const logs: NotificationLog[] = Array.isArray(rawData)
    ? rawData
    : (Array.isArray(rawData?.data)
      ? rawData.data
      : (Array.isArray(rawData?.items)
        ? rawData.items
        : []));

  const totalPages = rawData?.meta?.totalPages || rawData?.totalPages || 1;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Order Placed</span>;
      case 'payment_confirmation':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Payment OK</span>;
      case 'order_status_update':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Status Update</span>;
      case 'payment_failure':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Payment Failed</span>;
      case 'refund_notification':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Refund</span>;
      case 'password_reset':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Security / Reset</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Delivery Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit log of all transactional customer emails, order updates, payment receipts, and delivery events
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by recipient email address..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Event Types</option>
            <option value="order_confirmation">Order Confirmation</option>
            <option value="payment_confirmation">Payment Confirmation</option>
            <option value="order_status_update">Status Update</option>
            <option value="payment_failure">Payment Failure</option>
            <option value="refund_notification">Refund Notification</option>
            <option value="password_reset">Password Reset</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="success">Success / Delivered</option>
            <option value="failed">Failed / Bounced</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState
            title="No notification delivery logs found"
            description="Audit events will record here whenever transactional emails or SMS are triggered by store actions."
            icon={HiOutlineEnvelope}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Event Type</th>
                    <th className="px-5 py-3.5">Recipient</th>
                    <th className="px-5 py-3.5">Subject / Header</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log) => {
                    const isOk = (log.status || '').toLowerCase() === 'success';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isOk
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {isOk ? (
                              <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <HiOutlineXCircle className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            {isOk ? 'DELIVERED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {getTypeBadge(log.type)}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-800">
                          {log.recipientEmail || log.recipientPhone || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 max-w-xs truncate text-slate-900 font-medium">
                          {log.subject || log.title || log.message || 'Notification Message'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                          >
                            <HiOutlineDocumentText className="w-3.5 h-3.5" />
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

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Audit Log Record</h3>
                {getTypeBadge(selectedLog.type)}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Recipient</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedLog.recipientEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Sent Timestamp</span>
                  <span className="text-slate-700">{formatDate(selectedLog.createdAt)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium">
                  {selectedLog.subject || selectedLog.title || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content / Payload</label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                  {selectedLog.message || selectedLog.content || 'No text content available'}
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metadata Headers</label>
                  <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
