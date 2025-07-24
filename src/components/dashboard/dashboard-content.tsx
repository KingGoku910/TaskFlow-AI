'use client';

import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/dashboard/welcome-screen';
import { DashboardTiles } from '@/components/dashboard/dashboard-tiles';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface DashboardContentProps {
  initialTaskStats?: TaskStats | null;
  userId: string;
}

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  recentTasks: number;
  completionRate: number;
}

export function DashboardContent({ initialTaskStats, userId }: DashboardContentProps) {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkTutorialStatus();
  }, [userId]);

  const checkTutorialStatus = async () => {
    try {
      const supabase = createClient();
      
      // Check if user has completed tutorial
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('tutorial_completed, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking tutorial status:', error);
        setLoading(false);
        return;
      }

      // Check if user is new (created within last 24 hours) and hasn't completed tutorial
      const isNewUser = userProfile?.created_at && 
        new Date(userProfile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const shouldShowWelcome = !userProfile?.tutorial_completed && isNewUser;
      
      setIsFirstTimeUser(isNewUser || false);
      setShowWelcomeScreen(shouldShowWelcome);
      setLoading(false);
    } catch (error) {
      console.error('Error in checkTutorialStatus:', error);
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Mark tutorial as started and hide welcome screen
    setShowWelcomeScreen(false);
    markTutorialAsStarted();
  };

  const markTutorialAsStarted = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from('users')
        .update({ tutorial_completed: true })
        .eq('id', userId);
    } catch (error) {
      console.error('Error marking tutorial as started:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showWelcomeScreen) {
    return (
      <div className="dashboard-welcome-container">
        <WelcomeScreen onGetStarted={handleGetStarted} />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {isFirstTimeUser 
              ? "Welcome to TaskFlow AI! Here's your productivity command center."
              : "Welcome back! Here's an overview of your productivity tools and current progress."
            }
          </p>
        </div>

        <DashboardTiles initialTaskStats={initialTaskStats} />
      </div>
    </div>
  );
}
