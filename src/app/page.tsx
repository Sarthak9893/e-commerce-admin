'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const target = isAuthenticated ? '/dashboard' : '/login';
      if (typeof window !== 'undefined') {
        window.location.replace(target);
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Directing to Vastra Admin...</p>
        <a
          href="/login"
          className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 mt-2 transition-colors"
        >
          Click here if not redirected automatically
        </a>
      </div>
    </div>
  );
}
