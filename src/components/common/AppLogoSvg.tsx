// src/components/common/AppLogoSvg.tsx
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function AppLogoSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="360"
      height="360"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TaskFlow AI Logo"
      role="img"
      {...props}
      className={cn("h-[360px] w-[360px] text-primary", props.className)} // Default size & color, allow override
    >
      <title>TaskFlow AI Logo - Task List, Checkmark, and AI Accent</title>
      
      {/* Task list representation */}
      <line x1="6" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="6" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="6" y1="21" x2="14" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>

      {/* Checkmark - visually connected to the task flow */}
      <path d="M18 16 L21 19 L27 10" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

      {/* AI Spark/Dot - integrated accent */}
      <circle cx="25" cy="15" r="1.8" fill="currentColor" opacity="1"/>
    </svg>
  );
}
