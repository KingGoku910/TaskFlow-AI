// @/components/landing/elements/LdgListItem.tsx
import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LdgListItemProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

export function LdgListItem({ children, className, ...props }: LdgListItemProps) {
  return <li className={cn(className)} {...props}>{children}</li>;
}
