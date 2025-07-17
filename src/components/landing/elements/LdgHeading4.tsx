// @/components/landing/elements/LdgHeading4.tsx
import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgHeading4Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function LdgHeading4({ children, className, ...props }: LdgHeading4Props) {
  return <h4 className={cn(className)} {...props}>{children}</h4>;
}
