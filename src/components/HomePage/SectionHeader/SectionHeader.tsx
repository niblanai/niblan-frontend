import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  viewAllHref?: string;
  viewAllLabel: string;
}

export default function SectionHeader({ title, icon, viewAllHref, viewAllLabel }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-[#211B12]">{title}</h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-sm text-[#8A8172] hover:text-[#C69A3E] transition">
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
