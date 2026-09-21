'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import LoginForm from '../../../../components/auth/LoginForm';
import AuthShell from '../../../../components/auth/AuthShell';
import { login } from '../../../../services/auth.service';

function LoginContent() {
  const router = useRouter();
  const params = useParams() as { locale?: string } | undefined;
  const locale = params?.locale ?? 'en';
  const searchParams = useSearchParams();
  const oauthError = searchParams?.get('oauthError') ?? null;
  const [authError, setAuthError] = useState<string | null>(oauthError);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { email: string; password: string; remember: boolean }) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const result = await login(data);
      localStorage.setItem('niblan_token', result.token);
      router.push(`/${locale}`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell locale={locale}>
      <LoginForm
        onSubmit={handleSubmit}
        onForgotPassword={() => router.push(`/${locale}/auth/reset-password`)}
        onRegister={() => router.push(`/${locale}/auth/register`)}
        errorMessage={authError}
        isLoading={isLoading}
        locale={locale}
      />
    </AuthShell>
  );
}

export default function Page() {
  // useSearchParams() requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
