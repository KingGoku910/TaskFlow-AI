import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LdgSpanProps {
  children: ReactNode;
  className?: string;
}

export function LdgSpan({ children, className }: LdgSpanProps) {
  return <span className={cn(className)}>{children}</span>;
}
