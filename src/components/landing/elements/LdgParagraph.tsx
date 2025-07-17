import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LdgParagraphProps {
  children: ReactNode;
  className?: string;
}

export function LdgParagraph({ children, className }: LdgParagraphProps) {
  return <p className={cn(className)}>{children}</p>;
}
