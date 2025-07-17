// @/components/landing/elements/LdgUnorderedList.tsx
import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgUnorderedListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export function LdgUnorderedList({ children, className, ...props }: LdgUnorderedListProps) {
  return <ul className={cn(className)} {...props}>{children}</ul>;
}
