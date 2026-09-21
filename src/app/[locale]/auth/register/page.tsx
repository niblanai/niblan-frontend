'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RegisterForm from '../../../../components/auth/RegisterForm';
import AuthShell from '../../../../components/auth/AuthShell';
import { register } from '../../../../services/auth.service';

export default function Page() {
  const router = useRouter();
  const params = useParams() as { locale?: string } | undefined;
  const locale = params?.locale ?? 'en';
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { username: string; name: string; email: string; password: string; agreeTerms: boolean }) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const result = await register({
        username: data.username,
        displayName: data.name,
        email: data.email,
        password: data.password,
        agreeTerms: data.agreeTerms,
      });
      localStorage.setItem('niblan_token', result.token);
      router.push(`/${locale}`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell locale={locale}>
      <RegisterForm
        onSubmit={handleSubmit}
        onLogin={() => router.push(`/${locale}/auth/login`)}
        isLoading={isLoading}
        errorMessage={authError}
        locale={locale}
      />
    </AuthShell>
  );
}
