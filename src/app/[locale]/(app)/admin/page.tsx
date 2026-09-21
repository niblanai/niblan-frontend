'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminDashboard from '../../../../components/admin/Dashboard/AdminDashboard';
import AuthGuard from '../../../../components/auth/AuthGuard';

export default function Page() {
  const router = useRouter();
  const params = useParams() as { locale?: string } | undefined;
  const locale = params?.locale ?? 'ar';

  return (
    <AuthGuard onUnauthorized={() => router.push(`/${locale}/auth/login`)}>
      <AdminDashboard />
    </AuthGuard>
  );
}
