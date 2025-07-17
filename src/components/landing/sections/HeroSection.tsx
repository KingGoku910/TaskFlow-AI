
// @/components/landing/sections/HeroSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { HeroSvg } from '@/components/landing/hero-svg';
import { LdgHeading1 } from '../elements/LdgHeading1';
import { LdgParagraph } from '../elements/LdgParagraph';
import { LdgSpan } from '../elements/LdgSpan';
import { LdgDiv } from '../elements/LdgDiv';

export function HeroSection() {
  return (
    <section className="hero-section w-full py-12 md:py-24 lg:py-32 xl:py-36 animated-hero-gradient">
      <LdgDiv className="container mx-auto px-4 md:px-6">
        <LdgDiv className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <LdgDiv className="space-y-4 text-center lg:text-left">
            <LdgHeading1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-foreground">
              Transform Ideas into <LdgSpan className="text-primary">Actionable</LdgSpan> Tasks
            </LdgHeading1>
            <LdgParagraph className="max-w-[600px] text-foreground/90 dark:text-foreground/80 md:text-xl mx-auto lg:mx-0">
              Effecto TaskFlow leverages AI to break down complex goals into manageable steps. Manage your projects effortlessly with our intuitive Kanban board and intelligent features.
            </LdgParagraph>
            <LdgDiv className="space-x-4 mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/auth" prefetch={false} className="group w-full sm:w-auto">
                <Button >
                  Go to App <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </LdgDiv>
          </LdgDiv>
          <LdgDiv className="w-full flex justify-center items-center p-4 md:p-0">
            <HeroSvg />
          </LdgDiv>
        </LdgDiv>
      </LdgDiv>
    </section>
  );
}

