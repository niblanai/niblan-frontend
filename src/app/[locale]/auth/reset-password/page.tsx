"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import ResetPassword from '../../../../components/auth/ResetPassword';
import AuthShell from '../../../../components/auth/AuthShell';

export default function Page() {
  const router = useRouter();
  const params = useParams() as { locale?: string } | undefined;
  const locale = params?.locale ?? 'en';

  return (
    <AuthShell locale={locale}>
      <ResetPassword onBack={() => router.push(`/${locale}/auth/login`)} locale={locale} />
    </AuthShell>
  );
}
