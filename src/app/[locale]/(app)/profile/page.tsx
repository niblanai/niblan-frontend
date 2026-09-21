'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfileHeader from '../../../../components/profile/ProfileHeader';
import AuthGuard from '../../../../components/auth/AuthGuard';

export default function Page() {
  const router = useRouter();
  const params = useParams() as { locale?: string } | undefined;
  const locale = params?.locale ?? 'ar';

  return (
    <AuthGuard onUnauthorized={() => router.push(`/${locale}/auth/login`)}>
      <ProfileHeader />
    </AuthGuard>
  );
}