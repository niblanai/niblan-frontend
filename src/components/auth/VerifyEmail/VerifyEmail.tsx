"use client";
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface VerifyEmailProps {
  email?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  /** 'ar' for Arabic copy, anything else for English. */
  locale?: string;
}

const CODE_LENGTH = 6;

export default function VerifyEmail({
  email = 'user@example.com',
  onVerify,
  onResend,
  onBack,
  isLoading: externalLoading,
  locale = 'ar',
}: VerifyEmailProps) {
  const isArabic = locale === 'ar';
  const t = isArabic
    ? {
        back: 'رجوع',
        title: 'تحقق من بريدك الإلكتروني',
        sentTo: 'أرسلنا رمز تحقق من 6 أرقام إلى',
        verifying: 'جاري التحقق...',
        verify: 'تحقق',
        successMsg: 'تم التحقق بنجاح! جاري التحويل...',
        errorMsg: 'رمز التحقق غير صحيح، حاول مرة أخرى',
        resendIn: 'إعادة الإرسال بعد',
        resend: 'إعادة إرسال رمز التحقق',
        notReceived: 'لم تستلم الرمز؟',
        checkSpam: 'تحقق من مجلد الرسائل غير المرغوب فيها',
      }
    : {
        back: 'Back',
        title: 'Verify your email',
        sentTo: 'We sent a 6-digit code to',
        verifying: 'Verifying...',
        verify: 'Verify',
        successMsg: 'Verified! Redirecting...',
        errorMsg: 'Incorrect code, please try again',
        resendIn: 'Resend in',
        resend: 'Resend verification code',
        notReceived: "Didn't get the code?",
        checkSpam: 'Check your spam folder',
      };

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [internalLoading, setInternalLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const isLoading = externalLoading ?? internalLoading;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError(false);
    setSuccess(false);

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
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
    pasted.split('').forEach((char, i) => {
      newCode[i] = char;
    });
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();

    if (pasted.length === CODE_LENGTH) {
      handleVerify(pasted);
    }
  };

  const handleVerify = (codeStr?: string) => {
    const fullCode = codeStr || code.join('');
    if (fullCode.length !== CODE_LENGTH) return;

    if (externalLoading === undefined) {
      setInternalLoading(true);
      setTimeout(() => {
        setInternalLoading(false);
        setSuccess(true);
        onVerify?.(fullCode);
      }, 1500);
    } else {
      onVerify?.(fullCode);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCode(Array(CODE_LENGTH).fill(''));
    setError(false);
    setSuccess(false);
    setCountdown(60);
    onResend?.();
    inputRefs.current[0]?.focus();
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#8A8172] hover:text-[#C69A3E] transition-colors mb-7 group">
        <svg className={`w-4 h-4 transition-transform ${isArabic ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t.back}
      </button>

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C69A3E]/20 to-[#D9B565]/10 border border-[#C69A3E]/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#C69A3E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15130D]">{t.title}</h2>
        <p className="text-[#8A8172] mt-3 text-sm sm:text-base leading-relaxed">{t.sentTo}</p>
        <p className="text-[#15130D] font-bold mt-1 text-sm" dir="ltr">{email}</p>
      </div>

      {/* OTP Inputs */}
      <div className="flex gap-2.5 sm:gap-3 justify-center mb-6" dir="ltr">
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
            disabled={isLoading || success}
            className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold rounded-xl border outline-none transition-all duration-300 ${
              success
                ? 'bg-[#22c55e]/10 border-[#22c55e]/50 text-[#22c55e]'
                : error
                  ? 'bg-[#C0392B]/10 border-[#C0392B]/50 text-[#C0392B]'
                  : digit
                    ? 'bg-[#FBF7EC] border-[#C69A3E]/50 text-[#15130D]'
                    : 'bg-white border-[#E8DFCB] text-[#211B12] hover:border-[#D9B565]'
            } focus:border-[#C69A3E] focus:shadow-[0_0_0_3px_rgba(198,154,62,0.15)] focus:bg-white disabled:opacity-60`}
          />
        ))}
      </div>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center justify-center gap-2 mb-6 text-[#22c55e] text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t.successMsg}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center gap-2 mb-6 text-[#C0392B] text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {t.errorMsg}
        </div>
      )}

      {/* Resend */}
      <div className="text-center mb-8">
        {countdown > 0 ? (
          <p className="text-sm text-[#8A8172]">
            {t.resendIn}{' '}
            <span className="text-[#15130D] font-mono font-bold">{formatCountdown(countdown)}</span>
          </p>
        ) : (
          <button onClick={handleResend} className="text-sm text-[#C69A3E] hover:text-[#B78D34] transition-colors font-bold">
            {t.resend}
          </button>
        )}
      </div>

      {/* Manual Verify Button */}
      {!success && (
        <button
          onClick={() => {
            if (code.every((d) => d !== '')) {
              handleVerify();
            } else {
              setError(true);
              setTimeout(() => setError(false), 2000);
            }
          }}
          disabled={isLoading || code.some((d) => d === '')}
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
      )}

      {/* Help */}
      <p className="text-center text-sm text-[#8A8172] mt-6">
        {t.notReceived}{' '}
        <a href="#" className="text-[#4A4436] hover:text-[#C69A3E] transition-colors font-medium">{t.checkSpam}</a>
      </p>
    </div>
  );
}
