import React, { Suspense } from 'react';
import OAuthCallback from '../../../../../../components/auth/OAuthCallback';

export default function Page() {
  // OAuthCallback reads useSearchParams, which requires a Suspense boundary
  // in the App Router when statically rendered.
  return (
    <Suspense fallback={null}>
      <OAuthCallback />
    </Suspense>
  );
}
