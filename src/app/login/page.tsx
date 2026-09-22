'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiSparkles } from 'react-icons/hi2';
import { useLoginMutation } from '@/hooks/useAuthMutation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState('admin@aurastore.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please provide both email and password');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (response?.data?.accessToken) {
        const { accessToken, refreshToken } = response.data;
        
        // Save token immediately so subsequent requests are authorized
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Fetch user profile from /api/auth/me
        try {
          const profileRes = await authService.getProfile();
          const adminUser = profileRes.data || {
            id: 'admin_1',
            email,
            phone: '+919999999999',
            role: 'admin',
            isActive: true,
          };
          login(adminUser, accessToken, refreshToken);
        } catch {
          login(
            {
              id: 'admin_1',
              email,
              phone: '+919999999999',
              role: 'admin',
              isActive: true,
            },
            accessToken,
            refreshToken
          );
        }

        toast.success('Welcome back to Vastra Admin!');
        router.push('/dashboard');
      } else {
        toast.error(response?.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
    }
  };

  const fillCredentials = () => {
    setEmail('admin@aurastore.com');
    setPassword('Admin@123456');
    toast.success('Admin credentials applied');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/60">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 text-white font-black text-2xl mb-4">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vastra Admin Portal</h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Sign in to manage inventory, orders, products, and store analytics
          </p>
        </div>

        {/* Quick Fill Demo Credentials */}
        <div className="mb-6 bg-indigo-950/40 border border-indigo-900/40 rounded-xl p-3.5 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold text-indigo-300 block">Default Admin Account</span>
            <span className="text-slate-400 text-[11px]">admin@aurastore.com</span>
          </div>
          <button
            type="button"
            onClick={fillCredentials}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <HiSparkles className="w-3.5 h-3.5" />
            Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurastore.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? (
                  <HiOutlineEyeSlash className="w-4 h-4" />
                ) : (
                  <HiOutlineEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
              Remember session
            </label>
            <span className="text-slate-500 text-[11px]">Phone: +919999999999</span>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-slate-500">
          Vastra E-Commerce Platform &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
