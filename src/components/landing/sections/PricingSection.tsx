
// @/components/landing/sections/PricingSection.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { LdgDiv } from '../elements/LdgDiv';
import { LdgHeading2 } from '../elements/LdgHeading2';
import { LdgParagraph } from '../elements/LdgParagraph';
import { LdgSpan } from '../elements/LdgSpan';
import { LdgHeading3 } from '../elements/LdgHeading3';
import { LdgUnorderedList } from '../elements/LdgUnorderedList';
import { LdgListItem } from '../elements/LdgListItem';
import { cn } from '@/lib/utils';

interface PricingTierProps {
  title: string;
  price: string;
  pricePeriod?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined;
  isPopular?: boolean;
  highlighted?: boolean;
}

const PricingTierCard: React.FC<PricingTierProps> = ({
  title,
  price,
  pricePeriod,
  description,
  features,
  buttonText,
  buttonVariant = "outline",
  isPopular,
  highlighted,
}) => (
  <LdgDiv
    className={cn(
      "relative flex flex-col p-6 bg-card rounded-xl shadow-lg border transition-all duration-300 ease-in-out",
      highlighted
        ? "border-2 border-primary py-8 md:py-10 transform md:scale-105 z-10 shadow-2xl ring-1 ring-primary/20 bg-gradient-to-b dark:from-muted/10 from-secondary/20 to-card"
        : "border-gray-200 dark:border-[var(--sidebar-accent)] hover:border-primary hover:shadow-2xl hover:scale-[1.02]"
    )}
  >
    {isPopular && (
      <LdgDiv className="absolute top-0 -translate-y-1/2 right-1/2 translate-x-1/2 sm:right-6 sm:translate-x-0">
        <LdgSpan className="inline-flex items-center px-3 py-1.5 rounded-full text-[0.8rem] font-semibold tracking-wide bg-primary text-primary-foreground shadow-md whitespace-nowrap">
          Popular
        </LdgSpan>
      </LdgDiv>
    )}
    <LdgHeading3 className={cn(
        "text-2xl font-bold text-card-foreground mb-3 text-center pt-4",
        highlighted && "font-extrabold"
        )}>
        {title}
    </LdgHeading3>
    <LdgParagraph className="text-5xl font-extrabold text-primary mb-1 text-center">
      {price}
      {pricePeriod && <LdgSpan className="text-base font-normal text-muted-foreground dark:text-card-foreground/70">{pricePeriod}</LdgSpan>}
    </LdgParagraph>
    <LdgParagraph className="text-sm text-muted-foreground mb-8 text-center min-h-[2.5rem] dark:text-card-foreground/70">{description}</LdgParagraph>
    <LdgUnorderedList className="space-y-3.5 mb-10 text-sm text-card-foreground/90 flex-grow dark:text-card-foreground/90">
      {features.map((feature, index) => (
        <LdgListItem key={index} className="flex items-start">
          <Check className="h-5 w-5 text-primary mr-2.5 shrink-0 mt-0.5" />
          {/* Use standard span for dangerouslySetInnerHTML */}
          <span dangerouslySetInnerHTML={{ __html: feature }} />
        </LdgListItem>
      ))}
    </LdgUnorderedList>
    <Button variant={buttonVariant} size="lg" className="w-full mt-auto">{buttonText}</Button>
  </LdgDiv>
);


export function PricingSection() {
  const tiers: PricingTierProps[] = [
    {
      title: "Basic",
      price: "Free",
      description: "Perfect for individuals getting started with task management.",
      features: [
        "Up to 3 projects",
        "Standard Kanban board",
        "AI task decomposition (5 requests/month)",
        "Community support",
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline",
    },
    {
      title: "Pro",
      price: "$10",
      pricePeriod: "/month",
      description: "For professionals and small teams needing more power.",
      features: [
        "Unlimited projects & tasks",
        "Advanced Kanban features",
        "Unlimited AI task decomposition",
        "Voice control for tasks",
        "Priority email support",
        "Productivity Analytics",
        "Smart Meeting Integration",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default",
      isPopular: true,
      highlighted: true,
    },
    {
      title: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations and specific needs.",
      features: [
        "All Pro features, plus:",
        "Dedicated account manager",
        "SSO & advanced security options",
        "Custom integrations & API access",
        "Personalized onboarding & training",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ];
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background border-t">
      <LdgDiv className="container mx-auto px-4 md:px-6">
        <LdgDiv className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
          <LdgHeading2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
            Simple, Transparent <LdgSpan className="text-primary">Pricing</LdgSpan>
          </LdgHeading2>
          <LdgParagraph className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground/80">
            Choose the plan that's right for you and your team. Get started for free!
          </LdgParagraph>
        </LdgDiv>
        <LdgDiv className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {tiers.map((tier, index) => (
            <PricingTierCard key={index} {...tier} />
          ))}
        </LdgDiv>
      </LdgDiv>
    </section>
  );
}
