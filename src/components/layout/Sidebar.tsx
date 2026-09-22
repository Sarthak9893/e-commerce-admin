'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineFolder,
  HiOutlineArchiveBox,
  HiOutlineSparkles,
  HiOutlineTicket,
  HiOutlineStar,
  HiOutlineCreditCard,
  HiOutlinePhoto,
  HiOutlineTruck,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { useAuth } from '@/providers/AuthProvider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
  { label: 'Orders', href: '/orders', icon: HiOutlineShoppingBag },
  { label: 'Products', href: '/products', icon: HiOutlineCube },
  { label: 'Categories', href: '/categories', icon: HiOutlineFolder },
  { label: 'Inventory', href: '/inventory', icon: HiOutlineArchiveBox },
  { label: 'Collections', href: '/collections', icon: HiOutlineSparkles },
  { label: 'Coupons', href: '/coupons', icon: HiOutlineTicket },
  { label: 'Reviews', href: '/reviews', icon: HiOutlineStar },
  { label: 'Payments', href: '/payments', icon: HiOutlineCreditCard },
  { label: 'Banners', href: '/banners', icon: HiOutlinePhoto },
  { label: 'Shipping', href: '/shipping', icon: HiOutlineTruck },
  { label: 'Notifications', href: '/notifications', icon: HiOutlineBell },
  { label: 'Settings', href: '/settings', icon: HiOutlineCog6Tooth },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30">
              V
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">VASTRA</span>
              <span className="ml-1 text-[10px] font-semibold tracking-wider text-indigo-400 uppercase px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50">
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-300">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-indigo-400 text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@aurastore.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/50 hover:text-white transition-colors"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
