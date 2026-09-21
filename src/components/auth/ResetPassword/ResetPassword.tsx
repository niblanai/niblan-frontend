"use client";
import React, { useState } from 'react';
import { requestPasswordReset, confirmPasswordReset } from '@/services/auth.service';

interface ResetPasswordProps {
  onSubmit?: (data: { password: string; confirmPassword: string }) => void;
  onBack?: () => void;
  isLoading?: boolean;
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

export default function ResetPassword({
  onSubmit,
  onBack,
  isLoading: externalLoading,
  locale = 'ar',
}: ResetPasswordProps) {
  const isArabic = locale === 'ar';
  const t = isArabic
    ? {
        back: 'رجوع',
        title: 'تعيين كلمة مرور جديدة',
        subtitle: 'أدخل كلمة المرور الجديدة. تأكد من أنها قوية وآمنة.',
        emailLabel: 'البريد الإلكتروني',
        sendCode: 'إرسال رمز التحقق',
        sending: 'جاري الإرسال...',
        emailRequired: 'البريد مطلوب',
        sentFallback: 'تم إرسال رمز التحقق',
        updateFailed: 'فشل تحديث كلمة المرور',
        createFailed: 'فشل إنشاء رمز',
        newPwd: 'كلمة المرور الجديدة',
        confirmPwd: 'تأكيد كلمة المرور',
        strength: 'قوة كلمة المرور',
        matched: 'كلمتا المرور متطابقتان',
        mismatched: 'كلمتا المرور غير متطابقتين',
        requirementsTitle: 'متطلبات كلمة المرور',
        reqLength: '8 أحرف على الأقل',
        reqUpper: 'تحتوي على حرف كبير (A-Z)',
        reqDigit: 'تحتوي على رقم (0-9)',
        reqSymbol: 'تحتوي على رمز خاص (!@#$...)',
        tokenLabel: 'رمز إعادة التعيين',
        updating: 'جاري التحديث...',
        update: 'تحديث كلمة المرور',
        tokenHint: 'إذا وصلك الرمز عبر البريد، ضعه هنا مع كلمة المرور الجديدة.',
        successTitle: 'تم تغيير كلمة المرور',
        successBody: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        goToLogin: 'الذهاب لتسجيل الدخول',
      }
    : {
        back: 'Back',
        title: 'Set a new password',
        subtitle: 'Enter your new password. Make sure it is strong and secure.',
        emailLabel: 'Email',
        sendCode: 'Send verification code',
        sending: 'Sending...',
        emailRequired: 'Email is required',
        sentFallback: 'Verification code sent',
        updateFailed: 'Failed to update password',
        createFailed: 'Failed to create code',
        newPwd: 'New password',
        confirmPwd: 'Confirm password',
        strength: 'Password strength',
        matched: 'Passwords match',
        mismatched: 'Passwords do not match',
        requirementsTitle: 'Password requirements',
        reqLength: 'At least 8 characters',
        reqUpper: 'Contains an uppercase letter (A-Z)',
        reqDigit: 'Contains a number (0-9)',
        reqSymbol: 'Contains a special character (!@#$...)',
        tokenLabel: 'Reset code',
        updating: 'Updating...',
        update: 'Update password',
        tokenHint: 'If you received the code by email, enter it here with your new password.',
        successTitle: 'Password changed',
        successBody: 'Your password has been updated. You can now sign in with your new password.',
        goToLogin: 'Go to sign in',
      };

  const [email, setEmail] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isLoading = externalLoading ?? internalLoading;
  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit?.({ password, confirmPassword });
    e.preventDefault();
    // Confirm step: submit token + new password
    if (step === 'confirm') {
      if (passwordsMismatch) return;
      setInternalLoading(true);
      confirmPasswordReset(tokenInput, password)
        .then(() => {
          setSuccess(true);
        })
        .catch((err) => setInfoMessage(err instanceof Error ? err.message : t.updateFailed))
        .finally(() => setInternalLoading(false));
    }
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setInfoMessage(t.emailRequired);
    setInternalLoading(true);
    requestPasswordReset(email)
      .then((res) => {
        setInfoMessage(res.token ? `رمز إعادة التعيين: ${res.token}` : res.message || t.sentFallback);
        setStep('confirm');
      })
      .catch((err) => setInfoMessage(err instanceof Error ? err.message : t.createFailed))
      .finally(() => setInternalLoading(false));
  };

  if (success) {
    return (
      <div className="w-full">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15130D] mb-3">{t.successTitle}</h2>
          <p className="text-[#8A8172] text-sm sm:text-base leading-relaxed mb-8">{t.successBody}</p>

          <button
            onClick={onBack}
            className="group relative w-full py-4 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(198,154,62,0.5)] hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="relative flex items-center justify-center gap-2">
              <span>{t.goToLogin}</span>
              <svg className={`w-4 h-4 transition-transform duration-300 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const fieldBase =
    'w-full bg-white border rounded-xl py-4 px-4 text-sm text-[#211B12] placeholder-[#B3AB98] outline-none transition-all duration-300';
  const fieldFocused = 'border-[#C69A3E] shadow-[0_0_0_3px_rgba(198,154,62,0.15)]';
  const fieldIdle = 'border-[#E8DFCB] hover:border-[#D9B565]';

  const renderPasswordField = (
    fieldKey: string,
    value: string,
    setVal: (v: string) => void,
    label: string,
    show: boolean,
    setShow: (v: boolean) => void,
    hasError: boolean,
  ) => (
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
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setFocusedField(fieldKey)}
        onBlur={() => setFocusedField(null)}
        className={`${fieldBase} pl-4 pr-12 ${
          hasError
            ? 'border-[#C0392B]/60 shadow-[0_0_0_3px_rgba(192,57,43,0.12)]'
            : focusedField === fieldKey
              ? fieldFocused
              : fieldIdle
        }`}
        dir="ltr"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3AB98] hover:text-[#C69A3E] transition-colors"
        aria-label={isArabic ? 'إظهار كلمة المرور' : 'Show password'}
      >
        {show ? (
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
  );

  return (
    <div className="w-full">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#8A8172] hover:text-[#C69A3E] transition-colors mb-7 group">
        <svg className={`w-4 h-4 transition-transform ${isArabic ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t.back}
      </button>

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C69A3E]/20 to-[#D9B565]/10 border border-[#C69A3E]/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#C69A3E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15130D]">{t.title}</h2>
        <p className="text-[#8A8172] mt-3 text-sm sm:text-base leading-relaxed">{t.subtitle}</p>
      </div>

      {step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-5">
          <div className="relative">
            <label
              className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                focusedField === 'request-email' || email
                  ? 'top-2 text-[10px] text-[#C69A3E] font-bold tracking-wider uppercase bg-white px-1'
                  : 'top-1/2 -translate-y-1/2 text-sm text-[#8A8172]'
              }`}
            >
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('request-email')}
              onBlur={() => setFocusedField(null)}
              className={`${fieldBase} ${focusedField === 'request-email' ? fieldFocused : fieldIdle}`}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-4 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-bold text-sm transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(198,154,62,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? t.sending : t.sendCode}
          </button>
          {infoMessage && <div className="text-sm text-[#8A8172] bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl p-3">{infoMessage}</div>}
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          {renderPasswordField('password', password, setPassword, t.newPwd, showPassword, setShowPassword, false)}

          {/* Strength */}
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
            </div>
          )}

          {/* Confirm Password */}
          {renderPasswordField('confirm', confirmPassword, setConfirmPassword, t.confirmPwd, showConfirm, setShowConfirm, !!passwordsMismatch)}

          {/* Match Indicator */}
          {passwordsMatch && (
            <div className="flex items-center gap-2 text-[#22c55e] text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {t.matched}
            </div>
          )}

          {passwordsMismatch && (
            <div className="flex items-center gap-2 text-[#C0392B] text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t.mismatched}
            </div>
          )}

          {/* Requirements */}
          <div className="p-4 rounded-xl bg-[#FBF7EC] border border-[#E8DFCB] space-y-2.5">
            <p className="text-xs text-[#8A8172] font-bold uppercase tracking-wider mb-3">{t.requirementsTitle}</p>
            {[
              { text: t.reqLength, met: password.length >= 8 },
              { text: t.reqUpper, met: /[A-Z]/.test(password) },
              { text: t.reqDigit, met: /[0-9]/.test(password) },
              { text: t.reqSymbol, met: /[^A-Za-z0-9]/.test(password) },
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${req.met ? 'bg-[#22c55e]/20' : 'bg-[#F0E7CE]'}`}>
                  {req.met ? (
                    <svg className="w-2.5 h-2.5 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D9B565]" />
                  )}
                </div>
                <span className={`text-xs transition-colors duration-300 ${req.met ? 'text-[#4A4436] font-medium' : 'text-[#8A8172]'}`}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>

          {/* Token input */}
          <div className="relative">
            <label
              className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
                focusedField === 'token' || tokenInput
                  ? 'top-2 text-[10px] text-[#C69A3E] font-bold tracking-wider uppercase bg-white px-1'
                  : 'top-1/2 -translate-y-1/2 text-sm text-[#8A8172]'
              }`}
            >
              {t.tokenLabel}
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onFocus={() => setFocusedField('token')}
              onBlur={() => setFocusedField(null)}
              className={`${fieldBase} ${focusedField === 'token' ? fieldFocused : fieldIdle}`}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword || passwordsMismatch || !tokenInput}
            className="group relative w-full py-4 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(198,154,62,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t.updating}</span>
                </>
              ) : (
                <>
                  <span>{t.update}</span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </span>
          </button>
          {infoMessage && <div className="text-sm text-[#8A8172] bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl p-3">{infoMessage}</div>}
          <div className="text-sm text-[#8A8172] mt-1">{t.tokenHint}</div>
        </form>
      )}
    </div>
  );
}
