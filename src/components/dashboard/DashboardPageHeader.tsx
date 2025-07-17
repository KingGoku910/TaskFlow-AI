
'use client';

import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function DashboardPageHeader({ title, description, icon }: DashboardPageHeaderProps) {
  return (
    <>
      <div className="text-2xl font-semibold tracking-tight flex items-center">
        {icon && <span className="mr-3 h-7 w-7 text-primary">{icon}</span>}
        {title}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </>
  );
}
