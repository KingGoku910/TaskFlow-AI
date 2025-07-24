// @/components/landing/sections/FeatureDetailsSection.tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { AiDecompositionDetailSvg } from '@/components/landing/AiDecompositionDetailSvg';
import { KanbanDetailSvg } from '@/components/landing/KanbanDetailSvg';
import { TaskManagementDetailSvg } from '@/components/landing/TaskManagementDetailSvg';
import { VoiceControlDetailSvg } from '@/components/landing/VoiceControlDetailSvg';
import { AnalyticsDetailSvg } from '@/components/landing/AnalyticsDetailSvg';
import { MeetingDetailSvg } from '@/components/landing/MeetingDetailSvg';
import { LdgDiv } from '../elements/LdgDiv';
import { LdgHeading2 } from '../elements/LdgHeading2';
import { LdgParagraph } from '../elements/LdgParagraph';
import { LdgSpan } from '../elements/LdgSpan';
import { LdgHeading3 } from '../elements/LdgHeading3';
import { LdgUnorderedList } from '../elements/LdgUnorderedList';
import { LdgListItem } from '../elements/LdgListItem';

interface FeatureDetailItemProps {
  svg: React.ReactNode;
  badgeText: string;
  title: string;
  description: string;
  listItems: string[];
  comingSoon?: boolean;
  imagePosition?: 'left' | 'right';
}

const FeatureDetailItem: React.FC<FeatureDetailItemProps> = ({
  svg,
  badgeText,
  title,
  description,
  listItems,
  comingSoon,
  imagePosition = 'left',
}) => (
  <LdgDiv className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
    <LdgDiv className={`flex justify-center ${imagePosition === 'right' ? 'md:order-last' : ''}`}>
      {svg}
    </LdgDiv>
    <LdgDiv className="space-y-4">
      <LdgDiv className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">{badgeText}</LdgDiv>
      <LdgHeading3 className="text-2xl font-bold text-foreground">
        {title}
        {/* Removed Coming Soon tag */}
      </LdgHeading3>
      <LdgParagraph className="text-muted-foreground dark:text-foreground/90">
        {description}
      </LdgParagraph>
      <LdgUnorderedList className="space-y-2 text-muted-foreground dark:text-foreground/90">
        {listItems.map((item, index) => (
          <LdgListItem key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-1 shrink-0" />
            <LdgSpan>{item}</LdgSpan>
          </LdgListItem>
        ))}
      </LdgUnorderedList>
    </LdgDiv>
  </LdgDiv>
);

export function FeatureDetailsSection() {
  const features = [
    {
      svg: <AiDecompositionDetailSvg />,
      badgeText: "Intelligent Planning",
      title: "AI-Powered Task Decomposition",
      description: "Stop staring at blank pages. Describe your high-level objective, and let our AI break it down into manageable, actionable subtasks. Each subtask comes with a suggested checklist, getting you started faster and ensuring nothing falls through the cracks.",
      listItems: [
        "Automatic subtask generation from broad goals.",
        "Pre-populated markdown checklists for each subtask.",
        "Saves time and reduces cognitive load in project planning.",
      ],
      imagePosition: 'left',
    },
    {
      svg: <KanbanDetailSvg />,
      badgeText: "Visual Workflow",
      title: "Seamless Kanban Experience",
      description: "Effortlessly manage your tasks with our intuitive drag-and-drop Kanban board. Visualize progress across 'Pending', 'In Progress', and 'Completed' stages. Click any task to view details, update its status, or interact with its checklist.",
      listItems: [
        "Smooth drag-and-drop functionality between columns.",
        "Clear visualization of task statuses and priorities.",
        "Interactive task cards with detailed views and checklists.",
      ],
      imagePosition: 'right',
    },
    {
      svg: <TaskManagementDetailSvg />,
      badgeText: "Efficient Organization",
      title: "All-in-One Task Management",
      description: "Beyond decomposition and Kanban, TaskFlow AI offers robust task management. Add, edit, and delete tasks, assign priorities, set deadlines, and write detailed descriptions with markdown support for checklists and formatting.",
      listItems: [
        "Create tasks manually with titles, descriptions, priorities, and deadlines.",
        "Edit any task detail at any time.",
        "Interactive checklists within task descriptions.",
      ],
      imagePosition: 'left',
    },
    {
      svg: <VoiceControlDetailSvg />,
      badgeText: "Hands-Free Productivity",
      title: "Intuitive Voice Control",
      description: "Manage your tasks without lifting a finger. Use simple voice commands to create new tasks, update existing ones, mark items as complete, or ask the AI to decompose a new objective for you.",
      listItems: [
        "Create tasks using natural language.",
        "Update task statuses or details via voice.",
        "Initiate AI task decomposition with a verbal command.",
      ],
      imagePosition: 'right',
    },
    {
      svg: <AnalyticsDetailSvg />,
      badgeText: "Data-Driven Insights",
      title: "Actionable Productivity Analytics",
      description: "Understand your work patterns and boost efficiency. Analytics will provide insights into task completion rates, time spent on projects, bottlenecks in your workflow, and overall productivity trends.",
      listItems: [
        "Track task completion velocity.",
        "Identify common roadblocks or delays.",
        "Visualize progress over time with charts and reports.",
      ],
      comingSoon: true,
      imagePosition: 'left',
    },
    {
      svg: <MeetingDetailSvg />,
      badgeText: "Streamlined Collaboration",
      title: "Smart Meeting Integration",
      description: "Turn discussions into actions. Our meeting integration will allow you to record meetings, receive AI-generated summaries and transcriptions, and automatically convert identified action items into tasks on your board.",
      listItems: [
        "Record audio from meetings directly or upload recordings.",
        "AI-powered transcription and summarization.",
        "Automatic creation of tasks from meeting action items.",
      ],
      comingSoon: true,
      imagePosition: 'right',
    },
  ];

  return (
    <section id="feature-details" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 border-t">
      <LdgDiv className="container mx-auto px-4 md:px-6">
        <LdgDiv className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <LdgHeading2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
            Dive Deeper into <LdgSpan className="text-primary">TaskFlow AI</LdgSpan>
          </LdgHeading2>
          <LdgParagraph className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground/80">
            Discover how our core features can revolutionize your productivity and project management.
          </LdgParagraph>
        </LdgDiv>
        <LdgDiv className="space-y-16 md:space-y-24">
          {features.map((feature, index) => (
            <FeatureDetailItem key={index} {...feature} />
          ))}
        </LdgDiv>
      </LdgDiv>
    </section>
  );
}
