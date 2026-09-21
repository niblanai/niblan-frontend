"use client";
import React, { useState } from 'react';
import OAuthButton from '../OAuthButton';

interface RegisterFormProps {
  onSubmit?: (data: { username: string; name: string; email: string; password: string; agreeTerms: boolean }) => void;
  onLogin?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  /** 'ar' for Arabic copy, anything else for English. */
  locale?: string;
}

function getPasswordStrength(password: string): { level: number; label: string; color: string; width: string } {
  if (!password) return { level: 0, label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'ضعيفة جداً', color: 'bg-[#C0392B]', width: '25%' },
    { label: 'ضعيفة', color: 'bg-orange-500', width: '50%' },
    { label: 'متوسطة', color: 'bg-yellow-500', width: '75%' },
    { label: 'قوية', color: 'bg-[#22c55e]', width: '100%' },
  ];

  const current = levels[score - 1] || levels[0];
  return { level: score, ...current };
}

export default function RegisterForm({
  onSubmit,
  onLogin,
  isLoading: externalLoading,
  errorMessage,
  locale = 'ar',
}: RegisterFormProps) {
  const isArabic = locale === 'ar';
  const t = isArabic
    ? {
        title: 'إنشاء حساب جديد',
        subtitle: 'انضم إلى niblan وابدأ رحلتك معنا',
        orEmail: 'أو سجّل بالبريد الإلكتروني',
        username: 'اسم المستخدم (بالإنجليزية، بدون مسافات)',
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        strength: 'قوة كلمة المرور',
        reqLength: '8 أحرف على الأقل',
        reqUpper: 'حرف كبير',
        reqDigit: 'رقم',
        reqSymbol: 'رمز خاص',
        agreePrefix: 'أوافق على',
        terms: 'الشروط والأحكام',
        andWord: 'و',
        privacy: 'سياسة الخصوصية',
        submitting: 'جاري إنشاء الحساب...',
        submit: 'إنشاء حساب',
        haveAccount: 'لديك حساب بالفعل؟',
        signIn: 'سجّل دخولك',
        footerTerms: 'الشروط والأحكام',
        footerPrivacy: 'سياسة الخصوصية',
        footerHelp: 'المساعدة',
      }
    : {
        title: 'Create account',
        subtitle: 'Join Niblan and start your journey',
        orEmail: 'or sign up with email',
        username: 'Username (English, no spaces)',
        name: 'Full name',
        email: 'Email',
        password: 'Password',
        strength: 'Password strength',
        reqLength: '8+ characters',
        reqUpper: 'Uppercase',
        reqDigit: 'Number',
        reqSymbol: 'Symbol',
        agreePrefix: 'I agree to the',
        terms: 'Terms',
        andWord: 'and',
        privacy: 'Privacy Policy',
        submitting: 'Creating account...',
        submit: 'Create account',
        haveAccount: 'Already have an account?',
        signIn: 'Sign in',
        footerTerms: 'Terms',
        footerPrivacy: 'Privacy',
        footerHelp: 'Help',
      };

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const isLoading = externalLoading ?? internalLoading;
  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (externalLoading === undefined) setInternalLoading(true);
    onSubmit?.({ username, name, email, password, agreeTerms });
    if (externalLoading === undefined) setTimeout(() => setInternalLoading(false), 2000);
  };

  const fieldBase =
    'w-full bg-white border rounded-xl py-4 px-4 text-sm text-[#211B12] placeholder-transparent outline-none transition-all duration-300';
  const fieldFocused = 'border-[#C69A3E] shadow-[0_0_0_3px_rgba(198,154,62,0.15)] bg-white';
  const fieldIdle = 'border-[#E8DFCB] hover:border-[#D9B565]';

  const renderField = (fieldKey: string, value: string, label: string, type: string = 'text', extra?: React.ReactNode) => (
    <div className="relative">
      <label
        className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
          focusedField === fieldKey || value
            ? 'top-2 text-[10px] text-[#C69A3E] font-bold tracking-wider uppercase bg-white px-1'
            : 'top-1/2 -translate-y-1/2 text-sm text-[#8A8172]'
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (fieldKey === 'username') setUsername(e.target.value);
          if (fieldKey === 'name') setName(e.target.value);
          if (fieldKey === 'email') setEmail(e.target.value);
          if (fieldKey === 'password') setPassword(e.target.value);
        }}
        onFocus={() => setFocusedField(fieldKey)}
        onBlur={() => setFocusedField(null)}
        className={`${fieldBase} ${extra ? 'pr-12 pl-4' : 'px-4'} ${focusedField === fieldKey ? fieldFocused : fieldIdle}`}
        dir={fieldKey === 'name' ? 'rtl' : 'ltr'}
      />
      {extra}
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15130D]">{t.title}</h2>
        <p className="text-[#8A8172] mt-2 text-sm sm:text-base">{t.subtitle}</p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-[#C0392B]/30 bg-[#C0392B]/10 p-4 text-sm text-[#C0392B] mb-5" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <OAuthButton provider="google" locale={locale} />
        <OAuthButton provider="apple" locale={locale} />
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        {renderField('username', username, t.username)}

        {/* Full Name */}
        {renderField('name', name, t.name)}

        {/* Email */}
        {renderField('email', email, t.email, 'email')}

        {/* Password */}
        {renderField(
          'password',
          password,
          t.password,
          showPassword ? 'text' : 'password',
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
        )}

        {/* Password Strength */}
        {password && (
          <div className="space-y-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8A8172]">{t.strength}</span>
              <span className="text-xs font-semibold" style={{ color: strength.level >= 3 ? '#22c55e' : strength.level >= 2 ? '#eab308' : '#C0392B' }}>
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 bg-[#F0E7CE] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${strength.color}`} style={{ width: strength.width }} />
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { req: t.reqLength, met: password.length >= 8 },
                { req: t.reqUpper, met: /[A-Z]/.test(password) },
                { req: t.reqDigit, met: /[0-9]/.test(password) },
                { req: t.reqSymbol, met: /[^A-Za-z0-9]/.test(password) },
              ].map((item, i) => (
                <span key={i} className={`text-[10px] transition-colors duration-300 ${item.met ? 'text-[#22c55e] font-semibold' : 'text-[#B3AB98]'}`}>
                  {item.req}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <label className="group flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input type="checkbox" className="peer sr-only" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
            <div className="w-5 h-5 rounded-md border border-[#E8DFCB] bg-white peer-checked:bg-[#C69A3E] peer-checked:border-[#C69A3E] transition-all duration-300" />
            <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-sm text-[#4A4436] leading-relaxed">
            {t.agreePrefix}{' '}
            <a href="#" className="text-[#C69A3E] hover:text-[#B78D34] transition-colors font-semibold">{t.terms}</a>
            {' '}{t.andWord}{' '}
            <a href="#" className="text-[#C69A3E] hover:text-[#B78D34] transition-colors font-semibold">{t.privacy}</a>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !agreeTerms}
          className="group relative w-full py-4 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(198,154,62,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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

      {/* Login Link */}
      <p className="text-center text-sm text-[#8A8172] mt-8">
        {t.haveAccount}{' '}
        <button type="button" onClick={onLogin} className="text-[#15130D] font-bold hover:text-[#C69A3E] transition-colors">
          {t.signIn}
        </button>
      </p>

      <div className="mt-10 pt-6 border-t border-[#E8DFCB] flex items-center justify-center gap-4">
        <a href="#" className="text-xs text-[#8A8172] hover:text-[#C69A3E] transition-colors">{t.footerTerms}</a>
        <span className="text-[#D9B565]">•</span>
        <a href="#" className="text-xs text-[#8A8172] hover:text-[#C69A3E] transition-colors">{t.footerPrivacy}</a>
        <span className="text-[#D9B565]">•</span>
        <a href="#" className="text-xs text-[#8A8172] hover:text-[#C69A3E] transition-colors">{t.footerHelp}</a>
      </div>
    </div>
  );
}
