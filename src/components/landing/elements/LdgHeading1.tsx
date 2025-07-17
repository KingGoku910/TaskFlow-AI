import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LdgHeading1Props {
  children: ReactNode;
  className?: string;
}

export function LdgHeading1({ children, className }: LdgHeading1Props) {
  return <h1 className={cn(className)}>{children}</h1>;
}
