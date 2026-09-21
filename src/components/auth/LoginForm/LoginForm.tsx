"use client";
import React, { useState } from 'react';
import OAuthButton from '../OAuthButton';
import { login, saveToken } from '../../../services/auth.service';

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void;
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  /** 'ar' for Arabic copy, anything else for English. */
  locale?: string;
}

export default function LoginForm({
  onSubmit,
  onSuccess,
  onForgotPassword,
  onRegister,
  isLoading: externalLoading,
  errorMessage,
  locale = 'ar',
}: LoginFormProps) {
  const isArabic = locale === 'ar';
  const t = isArabic
    ? {
        title: 'تسجيل الدخول',
        subtitle: 'أدخل بياناتك للوصول إلى حسابك',
        orEmail: 'أو استخدم البريد الإلكتروني',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        remember: 'تذكرني',
        forgot: 'نسيت كلمة المرور؟',
        submitting: 'جاري تسجيل الدخول...',
        submit: 'تسجيل الدخول',
        noAccount: 'ليس لديك حساب؟',
        createAccount: 'أنشئ حساب جديد',
        terms: 'الشروط والأحكام',
        privacy: 'سياسة الخصوصية',
        help: 'المساعدة',
        failed: 'فشل تسجيل الدخول',
      }
    : {
        title: 'Sign in',
        subtitle: 'Enter your details to access your account',
        orEmail: 'or use your email',
        email: 'Email',
        password: 'Password',
        remember: 'Remember me',
        forgot: 'Forgot password?',
        submitting: 'Signing in...',
        submit: 'Sign in',
        noAccount: "Don't have an account?",
        createAccount: 'Create one',
        terms: 'Terms',
        privacy: 'Privacy',
        help: 'Help',
        failed: 'Sign in failed',
      };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  const isLoading = externalLoading ?? internalLoading;
  const displayError = errorMessage ?? internalError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, remember });

    setInternalError(null);
    setInternalLoading(true);
    try {
      const result = await login({ email, password, remember });
      saveToken(result.token);
      onSuccess?.();
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : t.failed);
    } finally {
      setInternalLoading(false);
    }
  };

  const fieldBase =
    'w-full bg-white border rounded-xl py-4 px-4 text-sm text-[#211B12] placeholder-transparent outline-none transition-all duration-300';
  const fieldFocused = 'border-[#C69A3E] shadow-[0_0_0_3px_rgba(198,154,62,0.15)] bg-white';
  const fieldIdle = 'border-[#E8DFCB] hover:border-[#D9B565]';

  return (
    <div className="w-full">
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15130D]">{t.title}</h2>
        <p className="text-[#8A8172] mt-2 text-sm sm:text-base">{t.subtitle}</p>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <OAuthButton provider="google" locale={locale} />
        <OAuthButton provider="github" locale={locale} />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E8DFCB]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-xs text-[#B3AB98] tracking-wide uppercase">{t.orEmail}</span>
        </div>
      </div>

      {/* Error */}
      {displayError ? (
        <div className="rounded-2xl border border-[#C0392B]/30 bg-[#C0392B]/10 p-4 text-sm text-[#C0392B] mb-5" role="alert">
          {displayError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="relative">
          <label
            className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
              focusedField === 'email' || email
                ? 'top-2 text-[10px] text-[#C69A3E] font-bold tracking-wider uppercase bg-white px-1'
                : 'top-1/2 -translate-y-1/2 text-sm text-[#8A8172]'
            }`}
          >
            {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className={`${fieldBase} ${focusedField === 'email' ? fieldFocused : fieldIdle}`}
            dir="ltr"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label
            className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
              focusedField === 'password' || password
                ? 'top-2 text-[10px] text-[#C69A3E] font-bold tracking-wider uppercase bg-white px-1'
                : 'top-1/2 -translate-y-1/2 text-sm text-[#8A8172]'
            }`}
          >
            {t.password}
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className={`${fieldBase} pr-12 pl-4 ${focusedField === 'password' ? fieldFocused : fieldIdle}`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3AB98] hover:text-[#C69A3E] transition-colors"
            aria-label={isArabic ? 'إظهار كلمة المرور' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="group flex items-center gap-2.5 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="peer sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <div className="w-5 h-5 rounded-md border border-[#E8DFCB] bg-white peer-checked:bg-[#C69A3E] peer-checked:border-[#C69A3E] transition-all duration-300" />
              <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-sm text-[#4A4436] group-hover:text-[#211B12] transition-colors">{t.remember}</span>
          </label>

          <button type="button" onClick={onForgotPassword} className="text-sm text-[#C69A3E] hover:text-[#B78D34] transition-colors font-semibold">
            {t.forgot}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full py-4 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(198,154,62,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t.submitting}</span>
              </>
            ) : (
              <>
                <span>{t.submit}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </span>
        </button>
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-[#8A8172] mt-8">
        {t.noAccount}{' '}
        <button type="button" onClick={onRegister} className="text-[#15130D] font-bold hover:text-[#C69A3E] transition-colors">
          {t.createAccount}
        </button>
      </p>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[#E8DFCB] flex items-center justify-center gap-4">
        <a href="#" className="text-xs text-[#8A8172] hover:text-[#C69A3E] transition-colors">{t.terms}</a>
        <span className="text-[#D9B565]">•</span>
        <a href="#" className="text-xs text-[#8A8172] hover:text-[#C69A3E] transition-colors">{t.privacy}</a>
        <span className="text-[#D9B565]">•</span>
        <a href="#" className="text-xs text-[#8A8172] hover:text-[#C69A3E] transition-colors">{t.help}</a>
      </div>
    </div>
  );
}
