"use client";
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../services/auth.service';

interface AuthGuardProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  onUnauthorized?: () => void;
  fallback?: React.ReactNode;
}

type GuardState = 'checking' | 'authorized' | 'unauthorized';

export default function AuthGuard({
  children,
  isAuthenticated = false,
  isLoading = false,
  onUnauthorized,
  fallback,
}: AuthGuardProps) {
  const [state, setState] = useState<GuardState>('checking');

  useEffect(() => {
    if (isLoading) {
      setState('checking');
      return;
    }

    if (isAuthenticated) {
      setState('authorized');
      return;
    }

    const token = localStorage.getItem('niblan_token');
    if (!token) {
      setState('unauthorized');
      onUnauthorized?.();
      return;
    }

    setState('checking');
    getCurrentUser(token)
      .then(() => setState('authorized'))
      .catch(() => {
        localStorage.removeItem('niblan_token');
        setState('unauthorized');
        onUnauthorized?.();
      });
  }, [isAuthenticated, isLoading, onUnauthorized]);

  // Checking State - Full screen loader
  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#f43f5e]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#0ea5e9]/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f43f5e] to-[#e11d48] flex items-center justify-center shadow-lg shadow-[#f43f5e]/30 animate-pulse">
            <span className="text-white font-bold text-2xl">N</span>
          </div>

          {/* Spinner */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f43f5e] animate-spin" />
          </div>

          <p className="text-sm text-slate-500 animate-pulse">جاري التحقق من هويتك...</p>
        </div>
      </div>
    );
  }

  // Unauthorized State
  if (state === 'unauthorized') {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#f43f5e]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#0ea5e9]/8 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center max-w-sm px-6">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-white mb-3">الوصول مقيّد</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة. ستجري إعادة توجيهك إلى صفحة تسجيل الدخول.
          </p>

          {/* Redirecting indicator */}
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-0 rounded-full border border-transparent border-t-[#f43f5e] animate-spin" />
            </div>
            <span>جاري إعادة التوجيه...</span>
          </div>
        </div>
      </div>
    );
  }

  // Authorized
  return <>{children}</>;
}