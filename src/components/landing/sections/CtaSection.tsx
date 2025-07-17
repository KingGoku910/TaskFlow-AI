// @/components/landing/sections/CtaSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { LdgDiv } from '../elements/LdgDiv';
import { LdgHeading2 } from '../elements/LdgHeading2';
import { LdgParagraph } from '../elements/LdgParagraph';

export function CtaSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/80 to-teal-600 text-primary-foreground border-t">
      <LdgDiv className="container mx-auto px-4 md:px-6">
        <LdgDiv className="flex flex-col items-center justify-center space-y-6 text-center">
          <LdgHeading2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Boost Your Productivity?
          </LdgHeading2>
          <LdgParagraph className="max-w-[700px] text-primary-foreground/80 md:text-xl">
            Join Effecto TaskFlow today and transform your workflow from chaotic to clear. Sign up for free and experience the power of AI-driven task management.
          </LdgParagraph>
          <Link href="/dashboard" prefetch={false}>
            <Button size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90">
              Sign Up for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </LdgDiv>
      </LdgDiv>
    </section>
  );
}
