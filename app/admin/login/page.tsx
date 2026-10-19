'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HotelLogo from '@/components/HotelLogo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Successful login
      router.push(from);
      router.refresh();
    } catch (err) {
      setError('Connection error. Please check your network and try again.');
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#161412] relative overflow-hidden">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C99A4A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#C99A4A]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1D1B18] border border-[#C99A4A]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-white">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-3">
            <HotelLogo variant="light" size="lg" showTagline={false} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin Portal
          </h1>
          <p className="text-xs text-[#D1C9BE] mt-1">
            Secure management console for Grand View Restaurant
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#D1C9BE] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@grandview.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#25221E] border border-white/10 text-sm text-white placeholder-[#77736C] focus:outline-hidden focus:border-[#C99A4A] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#D1C9BE] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77736C]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#25221E] border border-white/10 text-sm text-white placeholder-[#77736C] focus:outline-hidden focus:border-[#C99A4A] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77736C] hover:text-[#D1C9BE]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-gold py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill (For Review & Testing) */}
        <div className="mt-7 pt-6 border-t border-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C99A4A] mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Quick Login Credentials (Roles)</span>
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@grandview.com', 'GrandView@2026')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#C99A4A] text-left transition-colors"
            >
              <p className="font-bold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-[#A0988C]">Full Access</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('manager@grandview.com', 'Manager@2026')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#C99A4A] text-left transition-colors"
            >
              <p className="font-bold text-white truncate">Manager</p>
              <p className="text-[10px] text-[#A0988C]">Menu & Orders</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff@grandview.com', 'Staff@2026')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#C99A4A] text-left transition-colors"
            >
              <p className="font-bold text-white truncate">Staff</p>
              <p className="text-[10px] text-[#A0988C]">Order Status</p>
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#77736C]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted HttpOnly session protection enabled</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#161412] flex items-center justify-center text-white">Loading Admin Portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
