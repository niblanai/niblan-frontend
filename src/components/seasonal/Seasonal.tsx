import React from 'react';
import HomeHero from '../HomePage/HomeHero';
import HomeFeatures from '../HomePage/HomeFeatures';

type SeasonalProps = {
  locale?: string;
};

export default function Seasonal({ locale }: SeasonalProps) {
  return (
    <div>
      <HomeHero locale={locale} />
      <div className="max-w-6xl mx-auto mt-8">
        <HomeFeatures locale={locale} />
      </div>
    </div>
  );
}
