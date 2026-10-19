'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function Toast() {
  const { toasts } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-50 bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="animate-slide-up flex items-center gap-3 px-4 py-3 rounded-full bg-[#25221E]/95 text-white shadow-xl border border-[#B98A3E]/40 backdrop-blur-md pointer-events-auto"
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#D8B46A] shrink-0" />}
            {isError && <AlertCircle className="w-5 h-5 text-[#C94A4A] shrink-0" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-[#D8B46A] shrink-0" />}
            <span className="text-xs md:text-sm font-medium tracking-wide flex-1">
              {toast.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}