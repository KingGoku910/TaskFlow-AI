
'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export default function MeetingSummaryPage() {
  return (
    <div className="space-y-8 h-full overflow-y-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <DashboardPageHeader
            title="Smart Meeting Integration"
            description="Record meetings, get AI-generated summaries, and automatically create tasks from action items."
            icon={<Users />}
          />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-6 p-8 md:p-12 min-h-[50vh]">
             <Image
                src="https://placehold.co/600x400.png" // Placeholder for meeting interface
                alt="Meeting Interface Placeholder"
                width={600}
                height={400}
                className="rounded-lg shadow-md opacity-70"
                data-ai-hint="meeting interface collaboration"
            />
            <div className="flex items-center text-lg font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-md border border-amber-300 dark:border-amber-700">
                <AlertTriangle className="mr-3 h-8 w-8" />
                <p>Exciting meeting integration features are coming soon!</p>
            </div>
            <p className="text-muted-foreground max-w-md">
                Imagine effortlessly turning your meeting discussions into actionable tasks and clear summaries. This space will make it happen.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
