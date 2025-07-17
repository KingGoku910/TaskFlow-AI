// @/components/landing/sections/FeaturesOverviewSection.tsx
'use client';

import React from 'react';
import { BrainCircuit, LayoutDashboard, ListChecks, Mic, BarChart3, Users } from 'lucide-react';
import { LdgDiv } from '../elements/LdgDiv';
import { LdgHeading2 } from '../elements/LdgHeading2';
import { LdgParagraph } from '../elements/LdgParagraph';
import { LdgHeading3 } from '../elements/LdgHeading3';
import { LdgSpan } from '../elements/LdgSpan';


export function FeaturesOverviewSection() {
  const features = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "AI Task Decomposition",
      description: "Turn broad objectives into detailed, actionable subtasks automatically.",
      comingSoon: false,
    },
    {
      icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
      title: "Kanban Board",
      description: "Visualize your workflow with a drag-and-drop Kanban board. Track progress easily.",
      comingSoon: false,
    },
    {
      icon: <ListChecks className="h-10 w-10 text-primary" />,
      title: "Task Management",
      description: "Create, edit, and prioritize tasks with deadlines, descriptions, and statuses.",
      comingSoon: false,
    },
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Voice Control",
      description: "Manage tasks hands-free using voice commands.",
      comingSoon: false,
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Productivity Analytics",
      description: "Gain insights into your task completion rates and progress.",
      comingSoon: true,
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Meeting Integration",
      description: "Record meetings, get summaries, and convert discussions into tasks.",
      comingSoon: true,
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background border-t">
      <LdgDiv className="container mx-auto px-4 md:px-6">
        <LdgDiv className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <LdgDiv className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">Key Features</LdgDiv>
          <LdgHeading2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
            Everything You Need to Get Organized
          </LdgHeading2>
          <LdgParagraph className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground/80">
            From AI-powered task breakdown to visual project management, Effecto TaskFlow streamlines your workflow.
          </LdgParagraph>
        </LdgDiv>
        <LdgDiv className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {features.map((feature, index) => (
            <LdgDiv key={index} className="flex flex-col p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow bg-card h-full">
              <LdgDiv className="flex flex-col items-center gap-3 mb-3">
                {feature.icon}
                <LdgHeading3 className="text-xl font-bold text-card-foreground text-center">
                  {feature.title}
                  {feature.comingSoon && <LdgSpan className="text-xs text-primary/80 ml-1">(Coming Soon)</LdgSpan>}
                </LdgHeading3>
              </LdgDiv>
              <LdgParagraph className="text-sm text-muted-foreground flex-grow dark:text-card-foreground/80">
                {feature.description}
              </LdgParagraph>
            </LdgDiv>
          ))}
        </LdgDiv>
      </LdgDiv>
    </section>
  );
}
