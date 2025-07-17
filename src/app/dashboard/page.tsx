
import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { ensureUserProfileAndTutorialTasks, getTaskStats } from '@/app/dashboard/profile/actions';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { ErrorBoundary } from '@/components/error-boundary';
import { AlertTriangle } from 'lucide-react';

async function getCurrentUser() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Exception getting user:', error);
    return null;
  }
}

export default async function DashboardPage() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        console.log('Dashboard: No authenticated user, redirecting to auth');
        redirect('/auth');
    }

    let pageError: string | null = null;
    let taskStats = null;

    // Use Supabase user object properties
    const userId = currentUser.id;
    const userEmail = currentUser.email || '';

    try {
        // Ensure user profile exists and tutorial tasks are created
        const profileResult = await ensureUserProfileAndTutorialTasks(userId, userEmail, false); // Prevent SSR revalidation
        if (!profileResult.success) {
            console.error("Dashboard: Error ensuring user profile:", profileResult.error);
            pageError = `Failed to set up user profile: ${profileResult.error}`;
        }

        // Fetch task stats on server side
        const statsResult = await getTaskStats(userId);
        if (statsResult.success) {
            taskStats = statsResult.data;
        } else {
            console.error("Dashboard: Error fetching task stats:", statsResult.error);
        }
    } catch (error: any) {
        console.error("DashboardPage Server Component: Error during data fetching:", error);
        
        // Check if this is a missing table error
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
            pageError = "Database tables not set up yet. Please set up your Supabase database schema.";
        } else if (error?.message?.includes('Auth session missing')) {
            console.log('Dashboard: Auth session missing during data fetch, redirecting to auth');
            redirect('/auth');
        } else {
            const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
            pageError = `Failed to load dashboard data: ${errorMessage}`;
        }
    }

    return (
        <ErrorBoundary>
            <div className="dashboard-page-container space-y-6">
                {pageError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{pageError}</AlertDescription>
                    </Alert>
                )}

                <DashboardContent 
                    initialTaskStats={taskStats} 
                    userId={userId}
                />
            </div>
        </ErrorBoundary>
    );
}
