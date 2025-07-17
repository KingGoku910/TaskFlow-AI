// @/components/landing/elements/LdgHeading2.tsx
import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgHeading2Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function LdgHeading2({ children, className, ...props }: LdgHeading2Props) {
  return <h2 className={cn(className)} {...props}>{children}</h2>;
}
