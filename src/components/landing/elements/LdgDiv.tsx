// @/components/landing/elements/LdgDiv.tsx
import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgDivProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function LdgDiv({ children, className, ...props }: LdgDivProps) {
  return <div className={cn(className)} {...props}>{children}</div>;
}
