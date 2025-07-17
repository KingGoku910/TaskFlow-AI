// @/components/landing/elements/LdgAnchor.tsx
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export function LdgAnchor({ children, className, ...props }: LdgAnchorProps) {
  return <a className={cn(className)} {...props}>{children}</a>;
}
