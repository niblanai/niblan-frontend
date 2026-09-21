"use client";
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface MFAChallengeProps {
  method?: 'totp' | 'sms';
  maskedContact?: string;
  onVerify?: (code: string) => void;
  onFallback?: () => void;
  onResend?: () => void;
  onLogout?: () => void;
  isLoading?: boolean;
  /** 'ar' for Arabic copy, anything else for English. */
  locale?: string;
}

const CODE_LENGTH = 6;

export default function MFAChallenge({
  method = 'totp',
  maskedContact = '*** *** 4521',
  onVerify,
  onFallback,
  onResend,
  onLogout,
  isLoading: externalLoading,
  locale = 'ar',
}: MFAChallengeProps) {
  const isArabic = locale === 'ar';
  const t = isArabic
    ? {
        title: 'التحقق بخطوتين',
        totpDesc: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة الخاص بك',
        smsDescPrefix: 'أدخل الرمز المرسل إلى',
        totpLabel: 'تطبيق المصادقة',
        smsLabel: 'رسالة نصية SMS',
        attemptsLeft: 'المحاولات المتبقية',
        errorSuffixSingular: 'محاولة',
        errorSuffixPlural: 'محاولات',
        totpHint: 'الرمز يتجدد كل 30 ثانية تلقائياً في تطبيق المصادقة',
        resendIn: 'إعادة الإرسال بعد',
        resend: 'إعادة إرسال الرمز',
        verifying: 'جاري التحقق...',
        verify: 'تحقق',
        useSms: 'استخدم رمز SMS بدلاً من ذلك',
        useTotp: 'استخدم تطبيق المصادقة بدلاً من ذلك',
        orWord: 'أو',
        logout: 'تسجيل الخروج',
      }
    : {
        title: 'Two-step verification',
        totpDesc: 'Enter the 6-digit code from your authenticator app',
        smsDescPrefix: 'Enter the code sent to',
        totpLabel: 'Authenticator app',
        smsLabel: 'SMS message',
        attemptsLeft: 'Attempts left',
        errorSuffixSingular: 'attempt',
        errorSuffixPlural: 'attempts',
        totpHint: 'The code refreshes every 30 seconds in your authenticator app',
        resendIn: 'Resend in',
        resend: 'Resend code',
        verifying: 'Verifying...',
        verify: 'Verify',
        useSms: 'Use SMS code instead',
        useTotp: 'Use authenticator app instead',
        orWord: 'or',
        logout: 'Sign out',
      };

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [internalLoading, setInternalLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(3);

  const isLoading = externalLoading ?? internalLoading;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    if (method === 'totp') return; // TOTP doesn't need countdown
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, method]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError(false);

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== '') && index === CODE_LENGTH - 1) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();

    if (pasted.length === CODE_LENGTH) handleVerify(pasted);
  };

  const handleVerify = (codeStr?: string) => {
    const fullCode = codeStr || code.join('');
    if (fullCode.length !== CODE_LENGTH) return;

    if (externalLoading === undefined) {
      setInternalLoading(true);
      setTimeout(() => {
        setInternalLoading(false);
        setError(true);
        setAttempts((prev) => prev - 1);
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }, 1500);
    } else {
      onVerify?.(fullCode);
    }
  };

  const handleResend = () => {
    if (countdown > 0 || method === 'totp') return;
    setCode(Array(CODE_LENGTH).fill(''));
    setError(false);
    setCountdown(30);
    onResend?.();
    inputRefs.current[0]?.focus();
  };

  const formatCountdown = (seconds: number) => `${seconds}s`;

  return (
    <div className="w-full">
      {/* Shield Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C69A3E]/20 to-[#D9B565]/10 border border-[#C69A3E]/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#C69A3E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>

      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15130D]">{t.title}</h2>
        <p className="text-[#8A8172] mt-3 text-sm sm:text-base leading-relaxed">
          {method === 'totp'
            ? t.totpDesc
            : <>{t.smsDescPrefix} <span className="text-[#15130D] font-bold" dir="ltr">{maskedContact}</span></>
          }
        </p>
      </div>

      {/* Method Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FBF7EC] border border-[#E8DFCB] mb-7">
        <svg className="w-4 h-4 text-[#C69A3E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
        <span className="text-xs font-semibold text-[#4A4436]">
          {method === 'totp' ? t.totpLabel : t.smsLabel}
        </span>
      </div>

      {/* OTP Inputs */}
      <div className="flex gap-2.5 sm:gap-3 justify-center mb-4" dir="ltr">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isLoading}
            className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold rounded-xl border outline-none transition-all duration-300 ${
              error && index === 0
                ? 'bg-[#C0392B]/10 border-[#C0392B]/50 text-[#C0392B]'
                : digit
                  ? 'bg-[#FBF7EC] border-[#C69A3E]/50 text-[#15130D]'
                  : 'bg-white border-[#E8DFCB] text-[#211B12] hover:border-[#D9B565]'
            } focus:border-[#C69A3E] focus:shadow-[0_0_0_3px_rgba(198,154,62,0.15)] focus:bg-white disabled:opacity-50`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-center gap-2 mb-4 text-[#C0392B] text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {isArabic
            ? `رمز غير صحيح — متبقي ${attempts} ${attempts === 1 ? t.errorSuffixSingular : t.errorSuffixPlural}`
            : `Incorrect code — ${attempts} ${attempts === 1 ? t.errorSuffixSingular : t.errorSuffixPlural} left`}
        </div>
      )}

      {/* Attempts Remaining Bar */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] text-[#8A8172] uppercase tracking-wider">{t.attemptsLeft}</span>
        <div className="flex-1 h-1 bg-[#F0E7CE] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${attempts > 1 ? 'bg-[#C69A3E]' : 'bg-[#C0392B]'}`}
            style={{ width: `${(attempts / 3) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#8A8172] font-mono">{attempts}/3</span>
      </div>

      {/* Resend / TOTP hint */}
      <div className="text-center mb-8">
        {method === 'sms' ? (
          countdown > 0 ? (
            <p className="text-sm text-[#8A8172]">
              {t.resendIn} <span className="text-[#15130D] font-mono font-bold">{formatCountdown(countdown)}</span>
            </p>
          ) : (
            <button onClick={handleResend} className="text-sm text-[#C69A3E] hover:text-[#B78D34] transition-colors font-bold">
              {t.resend}
            </button>
          )
        ) : (
          <p className="text-xs text-[#8A8172]">{t.totpHint}</p>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={() => {
          if (code.every((d) => d !== '')) {
            handleVerify();
          } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
          }
        }}
        disabled={isLoading || code.some((d) => d === '') || attempts <= 0}
        className="group relative w-full py-4 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(198,154,62,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{t.verifying}</span>
            </>
          ) : (
            <>
              <span>{t.verify}</span>
              <svg className={`w-4 h-4 transition-transform duration-300 ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </span>
      </button>

      {/* Fallback & Logout */}
      <div className="mt-6 space-y-3">
        {onFallback && (
          <button onClick={onFallback} className="w-full text-sm text-[#8A8172] hover:text-[#C69A3E] transition-colors py-2">
            {method === 'totp' ? t.useSms : t.useTotp}
          </button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8DFCB]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-[#B3AB98]">{t.orWord}</span>
          </div>
        </div>

        {onLogout && (
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-sm text-[#8A8172] hover:text-[#C0392B] transition-colors py-2 group">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {t.logout}
          </button>
        )}
      </div>
    </div>
  );
}
