'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

function DeliveryLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/delivery';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/delivery/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid phone or password.');
        setLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError('Connection failed. Please check network and try again.');
      setLoading(false);
    }
  };

  const handleQuickFill = (p: string, pass: string) => {
    setPhone(p);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#161412] text-white flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#C99A4A]/20 border border-[#C99A4A]/40 flex items-center justify-center mx-auto mb-4 text-[#C99A4A]">
            <Bike className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C99A4A]">
            Grand View Restaurant
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-white">
            Delivery Partner Portal
          </h1>
          <p className="text-xs text-[#A0988C] mt-1.5">
            Log in to view and manage your assigned deliveries
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1D1B18] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#D1C9BE] mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#77736C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94471 23456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#77736C] focus:outline-none focus:border-[#C99A4A] focus:ring-1 focus:ring-[#C99A4A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1C9BE] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#77736C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your delivery password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#77736C] focus:outline-none focus:border-[#C99A4A] focus:ring-1 focus:ring-[#C99A4A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77736C] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#C99A4A] hover:bg-[#B0853D] active:scale-[0.99] disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#C99A4A]/25 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Deliveries</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill testing buttons */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] font-semibold text-[#A0988C] mb-2 text-center uppercase tracking-wider">
              Quick Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('+91 94471 23456', 'Delivery@2026')}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#C99A4A] text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-white truncate">Rashid Ali</p>
                <p className="text-[10px] text-[#A0988C]">Activa 6G</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('+91 94472 34567', 'Delivery@2026')}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#C99A4A] text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-white truncate">Sayed Koya</p>
                <p className="text-[10px] text-[#A0988C]">Splendor</p>
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#77736C]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted HttpOnly session protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#161412] flex items-center justify-center text-white">Loading Portal...</div>}>
      <DeliveryLoginForm />
    </Suspense>
  );
}
