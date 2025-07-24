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
      "relative flex flex-col p-8 bg-card rounded-2xl shadow-xl border transition-all duration-500 ease-in-out group",
      highlighted
        ? "border border-emerald-800/80 dark:border-emerald-900/80 hover:border-emerald-700/80 hover:shadow-2xl hover:scale-[1.03] hover:ring-2 hover:ring-emerald-700/20 dark:bg-emerald-900/20 backdrop-blur-sm py-10 md:py-12"
        : "border-2 border-primary transform scale-[0.95] z-10 shadow-2xl ring-2 ring-primary/30 bg-gradient-to-br dark:from-primary/5 dark:via-card dark:to-primary/10 from-primary/5 via-white to-primary/5"
    )}
  >
    {isPopular && (
      <LdgDiv className="absolute top-[70px] -right-2 w-20 h-20 overflow-visible">
        <LdgSpan className="absolute top-0 right-0 w-28 py-1 bg-primary text-white text-xs font-bold text-center leading-tight transform rotate-45 origin-top-right shadow-md">
          Popular
        </LdgSpan>
      </LdgDiv>
    )}
    <LdgDiv className="text-center mb-6">
      <LdgHeading3 className={cn(
          "text-2xl font-bold text-card-foreground mb-3",
          highlighted && "font-extrabold text-3xl"
          )}>
          {title}
      </LdgHeading3>
      <LdgDiv className="mb-4">
        <LdgParagraph className="text-6xl font-extrabold text-primary mb-2 leading-none">
          {price}
          {pricePeriod && <LdgSpan className="text-lg font-normal text-muted-foreground dark:text-card-foreground/70 ml-1">{pricePeriod}</LdgSpan>}
        </LdgParagraph>
        <LdgParagraph className="text-sm text-muted-foreground dark:text-card-foreground/70 min-h-[3rem] flex items-center justify-center px-2">{description}</LdgParagraph>
      </LdgDiv>
    </LdgDiv>
    <LdgUnorderedList className="space-y-4 mb-8 text-sm text-card-foreground/90 flex-grow dark:text-card-foreground/90">
      {features.map((feature, index) => (
        <LdgListItem key={index} className="flex items-start group">
          <Check className="h-5 w-5 text-primary mr-3 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" />
          <span dangerouslySetInnerHTML={{ __html: feature }} className="leading-relaxed" />
        </LdgListItem>
      ))}
    </LdgUnorderedList>
    <Button 
      variant={buttonVariant} 
      size="lg" 
      className={cn(
        "w-full mt-auto font-semibold py-3 transition-all duration-300",
        highlighted 
          ? "bg-emerald-800 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      )}
    >
      {buttonText}
    </Button>
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
    <section id="pricing" className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30 border-t relative overflow-hidden">
      {/* Background decoration */}
      <LdgDiv className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></LdgDiv>
  <LdgDiv className="absolute top-20 left-10 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl"></LdgDiv>
  <LdgDiv className="absolute bottom-20 right-10 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl"></LdgDiv>
      
      <LdgDiv className="container mx-auto px-4 md:px-6 relative z-10">
        <LdgDiv className="flex flex-col items-center justify-center space-y-6 text-center mb-16 md:mb-20">
      <LdgHeading2 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
        Simple, Transparent <LdgSpan className="bg-gradient-to-r from-primary to-gray-500 bg-clip-text text-transparent">Pricing</LdgSpan>
      </LdgHeading2>
          <LdgParagraph className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed dark:text-foreground/80">
            Choose the plan that's right for you and your team. Get started for free and scale as you grow!
          </LdgParagraph>
        </LdgDiv>
        <LdgDiv className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto items-stretch">
          {tiers.map((tier, index) => (
            <PricingTierCard key={index} {...tier} />
          ))}
        </LdgDiv>
      </LdgDiv>
    </section>
  );
}
