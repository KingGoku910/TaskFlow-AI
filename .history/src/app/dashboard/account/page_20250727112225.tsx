
'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { UserCircle, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export default function AccountPage() {
  return (
    <div className="w-full h-full overflow-y-auto flex-1 flex flex-col"> 
      <Card className="shadow-lg w-full"> 
        <CardHeader>
          <DashboardPageHeader
            title="My Account"
            description="View and manage your account details and profile information."
            icon={<UserCircle />}
          />
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 p-6 min-h-[40vh]">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Account Profile Placeholder"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg shadow-md opacity-70"
                data-ai-hint="profile user avatar"
            />
            <div className="flex items-center text-lg font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-md border border-amber-300 dark:border-amber-700">
                <AlertTriangle className="mr-3 h-8 w-8" />
                <p>Account management features are coming soon!</p>
            </div>
            <p className="text-muted-foreground">
                This is where you'll manage your profile, subscription, and other account-specific settings.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
