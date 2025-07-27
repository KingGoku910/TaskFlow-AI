'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, RefreshCw, HelpCircle, User, Shield, Palette, Laptop, Moon, Sun, CheckCircle, Clock, BookOpen, Paintbrush, Layout, Zap, Eye } from 'lucide-react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { restartTutorial, getTutorialProgress, getTaskStats, getUserPreferences, updateUserPreferences } from '@/app/dashboard/profile/actions';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const [isRestarting, setIsRestarting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState<string>('dark');
  const [tutorialProgress, setTutorialProgress] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        setCurrentUser(user);
        // Load tutorial progress and task stats
        loadTutorialProgress(user.id);
        loadTaskStats(user.id);
        loadUserPreferences(user.id);
      }
    };
    getUser();

    // Get current theme
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
  }, []);

  // Apply preferences when they load
  useEffect(() => {
    if (userPreferences) {
      applyThemeChanges(userPreferences);
    }
  }, [userPreferences]);

  // Add a timeout to prevent loading from getting stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingPreferences) {
        console.log('Settings: Preferences loading timeout, setting defaults');
        const defaultPreferences = {
          kanban: {
            todoColor: '#f59e0b',
            pendingColor: '#ffcc00', // Add yellow for pending
            inProgressColor: '#10b981',
            completedColor: '#14b8a6'
          },
          theme: {
            accentColor: '#14b8a6',
            borderRadius: 'medium',
            cardStyle: 'modern',
            fontSize: 'medium'
          },
          ui: {
            compactMode: false,
            showAnimations: true,
            highContrast: false
          }
        };
        setUserPreferences(defaultPreferences);
        setLoadingPreferences(false);
        
        toast({
          title: "Preferences Loaded",
          description: "Using default teal theme. Customization is available.",
        });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loadingPreferences, toast]);

  const loadTutorialProgress = async (userId: string) => {
    setLoadingProgress(true);
    try {
      const result = await getTutorialProgress(userId);
      if (result.success) {
        setTutorialProgress(result.data);
      }
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const loadTaskStats = async (userId: string) => {
    try {
      const result = await getTaskStats(userId);
      if (result.success) {
        setTaskStats(result.data);
      }
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  };

  const loadUserPreferences = async (userId: string) => {
    console.log('Settings: Loading user preferences for userId:', userId);
    setLoadingPreferences(true);
    try {
      const result = await getUserPreferences(userId);
      console.log('Settings: getUserPreferences result:', result);
      
      if (result.success) {
        console.log('Settings: Setting user preferences:', result.data);
        setUserPreferences(result.data);
      } else {
        console.error('Settings: Failed to load user preferences:', result.error);
        // Set default preferences if loading fails
        const defaultPreferences = {
          kanban: {
            todoColor: '#f59e0b',
          pendingColor: '#ffcc00', // Add yellow for pending
          inProgressColor: '#10b981', 
          completedColor: '#14b8a6'
          },
          theme: {
            accentColor: '#14b8a6',
            borderRadius: 'medium',
            cardStyle: 'modern',
            fontSize: 'medium'
          },
          ui: {
            compactMode: false,
            showAnimations: true,
            highContrast: false
          }
        };
        setUserPreferences(defaultPreferences);
        
        toast({
          title: "Preferences Loaded",
          description: "Using default preferences. Customization is still available.",
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Set default preferences if there's an error
      const defaultPreferences = {
        kanban: {
          todoColor: '#f59e0b',
          pendingColor: '#ffcc00', // Add yellow for pending
          inProgressColor: '#10b981', 
          completedColor: '#14b8a6'
        },
        theme: {
          accentColor: '#14b8a6',
          borderRadius: 'medium',
          cardStyle: 'modern',
          fontSize: 'medium'
        },
        ui: {
          compactMode: false,
          showAnimations: true,
          highContrast: false
        }
      };
      setUserPreferences(defaultPreferences);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleRestartTutorial = async () => {
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "User not found. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsRestarting(true);
    try {
      const result = await restartTutorial(currentUser.id);
      
      if (result.success) {
        toast({
          title: "Tutorial Restarted! 🎉",
          description: "Your tutorial tasks have been recreated. Check your dashboard to begin again.",
        });
        // Reload tutorial progress and task stats
        await loadTutorialProgress(currentUser.id);
        await loadTaskStats(currentUser.id);
      } else {
        toast({
          title: "Restart Failed",
          description: result.error || "Failed to restart tutorial. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error restarting tutorial:', error);
      toast({
        title: "Restart Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRestarting(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');

    // Update logo text color dynamically
    const logo = document.getElementById('site-logo');
    if (logo) {
      logo.style.color = newTheme === 'light' ? 'black' : 'white';
    }

    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const updatePreference = async (category: string, key: string, value: any) => {
    if (!currentUser || !userPreferences) return;

    setSavingPreferences(true);
    try {
      const updatedPreferences = {
        ...userPreferences,
        [category]: {
          ...userPreferences[category],
          [key]: value
        }
      };

      const result = await updateUserPreferences(currentUser.id, updatedPreferences);
      
      if (result.success) {
        setUserPreferences(updatedPreferences);
        
        // Apply theme changes immediately
        if (category === 'theme' || category === 'ui') {
          applyThemeChanges(updatedPreferences);
        }
        
        toast({
          title: "Preferences Updated",
          description: "Your customization has been saved successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to save preferences.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const resetToDefaultTheme = async () => {
    if (!currentUser) return;
    
    setSavingPreferences(true);
    try {
      // Reset to original teal theme
      const defaultPreferences = {
        kanban: {
          todoColor: '#f59e0b',
          pendingColor: '#ffcc00', // Add yellow for pending
          inProgressColor: '#10b981', 
          completedColor: '#14b8a6'
        },
        theme: {
          accentColor: '#14b8a6',     // Teal accent (original theme)
          borderRadius: 'medium',
          cardStyle: 'modern',
          fontSize: 'medium'
        },
        ui: {
          compactMode: false,
          showAnimations: true,
          highContrast: false
        }
      };

      const result = await updateUserPreferences(currentUser.id, defaultPreferences);
      
      if (result.success) {
        setUserPreferences(defaultPreferences);
        applyThemeChanges(defaultPreferences);
        
        toast({
          title: "Theme Reset",
          description: "Successfully restored the original teal theme.",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Failed to reset theme.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error resetting theme:', error);
      toast({
        title: "Reset Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const applyThemeChanges = (preferences: any) => {
    const root = document.documentElement;

    // Apply custom CSS variables for colors
    if (preferences.kanban) {
      root.style.setProperty('--kanban-todo-color', preferences.kanban.todoColor);
      root.style.setProperty('--kanban-progress-color', preferences.kanban.inProgressColor);
      root.style.setProperty('--kanban-completed-color', preferences.kanban.completedColor);
      root.style.setProperty('--kanban-pending-color', preferences.kanban.pendingColor);
    }

    // Use original teal color for accent
    root.style.setProperty('--accent-color', '#14b8a6');

    // Sidebar, menus, and footer
    root.style.setProperty('--sidebar-background', '#14b8a6');
    root.style.setProperty('--sidebar-border-color', '#14b8a6');
    root.style.setProperty('--menu-border-color', '#14b8a6');
    root.style.setProperty('--footer-background', '#14b8a6');
    root.style.setProperty('--footer-border-color', '#14b8a6');

    // Apply border radius
    const radiusMap = { small: '4px', medium: '8px', large: '12px' };
    root.style.setProperty('--border-radius', radiusMap[preferences.theme.borderRadius as keyof typeof radiusMap] || '8px');

    // Apply font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.theme.fontSize as keyof typeof fontSizeMap] || '16px');

    // Apply UI preferences
    if (preferences.ui) {
      root.style.setProperty('--animation-duration', preferences.ui.showAnimations ? '300ms' : '0ms');
      root.classList.toggle('high-contrast', preferences.ui.highContrast);
      root.classList.toggle('compact-mode', preferences.ui.compactMode);
    }

    // Force refresh styles
    const styleRefreshEvent = new Event('style-refresh');
    root.dispatchEvent(styleRefreshEvent);
  };

  return (
    <div className="w-full h-full overflow-y-auto flex-1 flex flex-col">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <DashboardPageHeader
            title="Application Settings"
            description="Manage your preferences, tutorial, and application settings."
            icon={<Settings />}
          />
        </CardHeader>
        <CardContent className="flex flex-col space-y-6 p-6">
          
          {/* Tutorial Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Tutorial & Onboarding</h3>
            </div>
            <Separator />
            
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Tutorial Status & Restart</span>
                </CardTitle>
                <CardDescription>
                  Monitor your tutorial progress or restart the welcome walkthrough to rediscover all features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Tutorial Progress Display */}
                {loadingProgress ? (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="h-4 w-4 animate-pulse" />
                    <span>Loading tutorial status...</span>
                  </div>
                ) : tutorialProgress ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tutorial Progress</span>
                      {tutorialProgress.hasActiveTutorial ? (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span>Active Tutorial</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <span>No Active Tutorial</span>
                        </Badge>
                      )}
                    </div>
                    
                    {tutorialProgress.hasActiveTutorial && (
                      <>
                        <Progress 
                          value={tutorialProgress.completionPercentage} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{tutorialProgress.completedTasks}/6 tasks completed</span>
                          <span>{tutorialProgress.completionPercentage}% complete</span>
                        </div>
                        
                        {tutorialProgress.completionPercentage === 100 && (
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Tutorial completed! 🎉</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>
                      Unable to load tutorial status. You can still restart the tutorial below.
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />
                
                <Alert className="mb-4">
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What happens when you restart:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Your existing tutorial tasks will be removed</li>
                      <li>• 6 new tutorial tasks will be created on your dashboard</li>
                      <li>• You'll get step-by-step guidance through all features</li>
                      <li>• Your other tasks and data remain unchanged</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleRestartTutorial}
                  disabled={isRestarting || !currentUser}
                  className="w-full sm:w-auto"
                  variant={tutorialProgress?.hasActiveTutorial ? "outline" : "default"}
                >
                  {isRestarting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Restarting Tutorial...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {tutorialProgress?.hasActiveTutorial ? "Restart Tutorial" : "Start Tutorial"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>
            <Separator />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>Theme</span>
                </CardTitle>
                <CardDescription>
                  Choose between light and dark mode for your interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Current theme: <strong className="capitalize">{theme}</strong></span>
                  <Button 
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Switch to Dark
                      </>
                    ) : (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Switch to Light
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Account & Statistics</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Details</CardTitle>
                  <CardDescription>
                    Your account information and session details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentUser ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-mono">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-xs">{currentUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Created:</span>
                        <span>{new Date(currentUser.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading user information...</p>
                  )}
                </CardContent>
              </Card>

              {/* Task Statistics Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Task Statistics</CardTitle>
                  <CardDescription>
                    Overview of your productivity and task completion.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taskStats ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
                          <div className="text-muted-foreground">Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                          <div className="text-muted-foreground">Completed</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">To Do:</span>
                          <Badge variant="secondary">{taskStats.todo}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">In Progress:</span>
                          <Badge variant="secondary">{taskStats.inProgress}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recent (7 days):</span>
                          <Badge variant="outline">{taskStats.recentTasks}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completion Rate:</span>
                          <Badge variant={taskStats.completionRate > 50 ? "default" : "secondary"}>
                            {taskStats.completionRate}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <span>Loading statistics...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Customization & Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Customization & Colors</h3>
            </div>
            <Separator />
            
            {userPreferences && !loadingPreferences ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Kanban Board Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Layout className="h-4 w-4" />
                      <span>Kanban Board Colors</span>
                    </CardTitle>
                    <CardDescription>
                      Customize the colors for your task board columns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="todo-color" className="text-sm font-medium">To Do Column</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-200 dark:border-[var(--sidebar-accent)] dark:hover:border-[var(--sidebar-accent-hov)]"
                            style={{ backgroundColor: userPreferences.kanban.todoColor }}
                          />
                          <input
                            type="color"
                            id="todo-color"
                            value={userPreferences.kanban.todoColor}
                            onChange={(e) => updatePreference('kanban', 'todoColor', e.target.value)}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                            disabled={savingPreferences}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="progress-color" className="text-sm font-medium">In Progress Column</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-200 dark:border-[var(--sidebar-accent)] dark:hover:border-[var(--sidebar-accent-hov)]"
                            style={{ backgroundColor: userPreferences.kanban.inProgressColor }}
                          />
                          <input
                            type="color"
                            id="progress-color"
                            value={userPreferences.kanban.inProgressColor}
                            onChange={(e) => updatePreference('kanban', 'inProgressColor', e.target.value)}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                            disabled={savingPreferences}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="completed-color" className="text-sm font-medium">Completed Column</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-200 dark:border-[var(--sidebar-accent)] dark:hover:border-[var(--sidebar-accent-hov)]"
                            style={{ backgroundColor: userPreferences.kanban.completedColor }}
                          />
                          <input
                            type="color"
                            id="completed-color"
                            value={userPreferences.kanban.completedColor}
                            onChange={(e) => updatePreference('kanban', 'completedColor', e.target.value)}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                            disabled={savingPreferences}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="pending-color" className="text-sm font-medium">Pending Column</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-200 dark:border-[var(--sidebar-accent)] dark:hover:border-[var(--sidebar-accent-hov)]"
                            style={{ backgroundColor: userPreferences.kanban.pendingColor }}
                          />
                          <input
                            type="color"
                            id="pending-color"
                            value={userPreferences.kanban.pendingColor}
                            onChange={(e) => updatePreference('kanban', 'pendingColor', e.target.value)}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                            disabled={savingPreferences}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <Palette className="h-4 w-4" />
                      <AlertDescription>
                        Changes are applied immediately. Your Kanban board will reflect these colors.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resetToDefaultTheme}
                        disabled={savingPreferences}
                        className="w-full"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${savingPreferences ? 'animate-spin' : ''}`} />
                        Reset to Original Teal Theme
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Customization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Interface Theme</span>
                    </CardTitle>
                    <CardDescription>
                      Customize the look and feel of your interface.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accent-color" className="text-sm font-medium">Accent Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-200 dark:border-[var(--sidebar-accent)] dark:hover:border-[var(--sidebar-accent-hov)]"
                            style={{ backgroundColor: userPreferences.theme.accentColor }}
                          />
                          <input
                            type="color"
                            id="accent-color"
                            value={userPreferences.theme.accentColor}
                            onChange={(e) => updatePreference('theme', 'accentColor', e.target.value)}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                            disabled={savingPreferences}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="border-radius" className="text-sm font-medium">Border Radius</Label>
                        <Select
                          value={userPreferences.theme.borderRadius}
                          onValueChange={(value) => updatePreference('theme', 'borderRadius', value)}
                          disabled={savingPreferences}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="card-style" className="text-sm font-medium">Card Style</Label>
                        <Select
                          value={userPreferences.theme.cardStyle}
                          onValueChange={(value) => updatePreference('theme', 'cardStyle', value)}
                          disabled={savingPreferences}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="font-size" className="text-sm font-medium">Font Size</Label>
                        <Select
                          value={userPreferences.theme.fontSize}
                          onValueChange={(value) => updatePreference('theme', 'fontSize', value)}
                          disabled={savingPreferences}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* UI Preferences */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Interface Preferences</span>
                    </CardTitle>
                    <CardDescription>
                      Control the behavior and appearance of interface elements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="compact-mode" className="text-sm font-medium">Compact Mode</Label>
                          <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                        </div>
                        <Switch
                          id="compact-mode"
                          checked={userPreferences.ui.compactMode}
                          onCheckedChange={(checked) => updatePreference('ui', 'compactMode', checked)}
                          disabled={savingPreferences}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="animations" className="text-sm font-medium">Animations</Label>
                          <p className="text-xs text-muted-foreground">Enable smooth transitions</p>
                        </div>
                        <Switch
                          id="animations"
                          checked={userPreferences.ui.showAnimations}
                          onCheckedChange={(checked) => updatePreference('ui', 'showAnimations', checked)}
                          disabled={savingPreferences}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="high-contrast" className="text-sm font-medium">High Contrast</Label>
                          <p className="text-xs text-muted-foreground">Improve accessibility</p>
                        </div>
                        <Switch
                          id="high-contrast"
                          checked={userPreferences.ui.highContrast}
                          onCheckedChange={(checked) => updatePreference('ui', 'highContrast', checked)}
                          disabled={savingPreferences}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>Loading customization options...</span>
                </div>
                
                {loadingPreferences && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">Loading your color preferences...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Future Features Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Additional Settings</h3>
            </div>
            <Separator />
            
            <Alert>
              <Laptop className="h-4 w-4" />
              <AlertDescription>
                <strong>Coming Soon:</strong> Additional settings for notifications, data export, privacy preferences, and integrations will be available in future updates.
              </AlertDescription>
            </Alert>
          </div>

        </CardContent>
      </Card>

      <div className="settings-dashboard-container lg:mb-10" /> {/* Add margin for large screens */}
    </div>
  );
}
