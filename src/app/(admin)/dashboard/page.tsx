'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { StatsCard } from '@/components/common/StatsCard';
import { StatusChip } from '@/components/common/StatusChip';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  useDashboardSummary,
  useSalesChart,
  useBestSellingProducts,
  useRecentOrders,
} from '@/hooks/useDashboard';

export default function DashboardPage() {
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');

  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const {
    data: salesChartResponse,
    isLoading: isChartLoading,
    refetch: refetchChart,
  } = useSalesChart(interval);

  const {
    data: bestSellingResponse,
    isLoading: isBestSellingLoading,
  } = useBestSellingProducts(5);

  const {
    data: recentOrdersResponse,
    isLoading: isOrdersLoading,
  } = useRecentOrders(5);

  const summary = summaryResponse?.data || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    revenuePercentageChange: 0,
    pendingOrdersCount: 0,
  };

  const chartData = Array.isArray(salesChartResponse?.data)
    ? salesChartResponse.data
    : [];

  const topProducts = Array.isArray(bestSellingResponse?.data)
    ? bestSellingResponse.data
    : [];

  const recentOrders = Array.isArray(recentOrdersResponse?.data)
    ? recentOrdersResponse.data
    : [];

  const handleRefresh = () => {
    refetchSummary();
    refetchChart();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time performance metrics and sales activity from AuraStore API
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Interval selector */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium">
            {(['day', 'week', 'month'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setInterval(item)}
                className={`px-3 py-1 rounded-md transition-all ${
                  interval === item
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh statistics"
          >
            <HiOutlineArrowPath className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Gross Sales"
          value={formatCurrency(summary.totalSales)}
          change={summary.revenuePercentageChange}
          icon={HiOutlineBanknotes}
          color="indigo"
        />
        <StatsCard
          title="Total Orders"
          value={summary.totalOrders.toLocaleString()}
          icon={HiOutlineShoppingBag}
          color="emerald"
        />
        <StatsCard
          title="Registered Customers"
          value={summary.totalCustomers.toLocaleString()}
          icon={HiOutlineUsers}
          color="sky"
        />
        <StatsCard
          title="Pending Orders"
          value={summary.pendingOrdersCount || 0}
          icon={HiOutlineClock}
          color="amber"
          changePeriod="Requires fulfillment"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue Trend</h2>
              <p className="text-xs text-slate-500">Gross sales performance over {interval} aggregation</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Live API
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Volume Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">Order Volume</h2>
            <p className="text-xs text-slate-500">Order fulfillment count by timeline</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [value, 'Orders']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Live incoming transactions</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <HiOutlineChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No recent orders recorded
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-indigo-600">
                        <Link href={`/orders`}>{order.orderNumber}</Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {order.customerName || order.shippingAddress?.fullName || 'Customer'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount || (order as any).total || 0)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Best Selling Products</h2>
              <p className="text-xs text-slate-500">Highest volume items</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Catalog
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No best selling products recorded
              </div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={prod.productId || idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">
                      {prod.productName || prod.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{prod.totalQuantitySold} sold • SKU: {prod.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(prod.totalRevenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
