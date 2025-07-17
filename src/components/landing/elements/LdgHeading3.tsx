// @/components/landing/elements/LdgHeading3.tsx
import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgHeading3Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function LdgHeading3({ children, className, ...props }: LdgHeading3Props) {
  return <h3 className={cn(className)} {...props}>{children}</h3>;
}
