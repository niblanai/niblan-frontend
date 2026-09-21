import React from 'react';
import Seasonal from '../../../../components/seasonal';

export default function Page(props: unknown) {
  const params = (props as { params?: { locale?: string } })?.params;
  const locale = params?.locale;
  return <Seasonal locale={locale} />;
}
