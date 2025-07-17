'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Key,
  Save,
  Edit,
  Camera,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  Globe,
  Clock,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  job_title?: string;
  website?: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    meeting_reminders: boolean;
    task_updates: boolean;
    weekly_summary: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'team';
    activity_status: boolean;
    analytics_sharing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    sound_effects: boolean;
  };
}

interface UserStats {
  total_meetings: number;
  total_tasks: number;
  total_summaries: number;
  streak_days: number;
  completion_rate: number;
  last_active: string;
}

export default function AccountProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      push: true,
      meeting_reminders: true,
      task_updates: true,
      weekly_summary: false,
    },
    privacy: {
      profile_visibility: 'private',
      activity_status: true,
      analytics_sharing: false,
    },
    appearance: {
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      sound_effects: true,
    },
  });
  const [stats, setStats] = useState<UserStats>({
    total_meetings: 0,
    total_tasks: 0,
    total_summaries: 0,
    streak_days: 0,
    completion_rate: 0,
    last_active: new Date().toISOString(),
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in to view your profile.',
          variant: 'destructive'
        });
        return;
      }

      // For demo purposes, create sample profile data
      const sampleProfile: UserProfile = {
        id: user.id,
        email: user.email || 'user@example.com',
        full_name: user.user_metadata?.full_name || 'John Doe',
        phone: '+1 (555) 123-4567',
        avatar_url: user.user_metadata?.avatar_url || '',
        bio: 'Product Manager passionate about productivity and team collaboration. I love building tools that help teams work better together.',
        location: 'San Francisco, CA',
        company: 'Tech Solutions Inc.',
        job_title: 'Senior Product Manager',
        website: 'https://johndoe.com',
        timezone: 'America/Los_Angeles',
        language: 'en',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: new Date().toISOString(),
      };

      const sampleStats: UserStats = {
        total_meetings: 124,
        total_tasks: 89,
        total_summaries: 67,
        streak_days: 12,
        completion_rate: 87,
        last_active: new Date().toISOString(),
      };

      setProfile(sampleProfile);
      setStats(sampleStats);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
      
      setEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAvatarUrl = URL.createObjectURL(file);
      setProfile(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null);
      
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload your avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
      
      setPasswordChangeMode(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Password Change Failed',
        description: 'Could not change your password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      
      // In real app, would redirect to login
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Could not delete your account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
      setShowDeleteDialog(false);
    }
  };

  const exportUserData = () => {
    const data = {
      profile,
      preferences,
      stats,
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `effecto-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Data Exported',
      description: 'Your profile data has been downloaded.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Could not load your profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account & Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button onClick={exportUserData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-lg">
                      {profile.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                  <p className="text-muted-foreground">{profile.job_title}</p>
                  <p className="text-sm text-muted-foreground">{profile.company}</p>
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Account
                  </Badge>
                </div>
                <Button
                  onClick={() => setEditingProfile(!editingProfile)}
                  variant={editingProfile ? "secondary" : "outline"}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              {editingProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, location: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, company: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={profile.job_title || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, job_title: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, website: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {editingProfile && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meeting Reminders</p>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming meetings</p>
                </div>
                <Switch
                  checked={preferences.notifications.meeting_reminders}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, meeting_reminders: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about task changes</p>
                </div>
                <Switch
                  checked={preferences.notifications.task_updates}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, task_updates: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-muted-foreground">Receive weekly productivity reports</p>
                </div>
                <Switch
                  checked={preferences.notifications.weekly_summary}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, weekly_summary: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.appearance.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      setPreferences(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, theme: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.appearance.language}
                    onValueChange={(value) => 
                      setPreferences(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, language: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">Play sounds for actions</p>
                </div>
                <Switch
                  checked={preferences.appearance.sound_effects}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, sound_effects: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password & Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!passwordChangeMode ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                  <Button onClick={() => setPasswordChangeMode(true)}>
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword} disabled={saving}>
                      {saving ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setPasswordChangeMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={preferences.privacy.profile_visibility}
                  onValueChange={(value: 'public' | 'private' | 'team') => 
                    setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profile_visibility: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Activity Status</p>
                  <p className="text-sm text-muted-foreground">Show when you're online</p>
                </div>
                <Switch
                  checked={preferences.privacy.activity_status}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, activity_status: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics Sharing</p>
                  <p className="text-sm text-muted-foreground">Share usage data to improve the app</p>
                </div>
                <Switch
                  checked={preferences.privacy.analytics_sharing}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics_sharing: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Deleting your account is permanent and cannot be undone. All your data will be lost.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Information
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Current Plan</span>
                  <Badge variant="secondary">Free Plan</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Free tier with basic features
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Tasks Usage</span>
                    <span>12 / 50</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/billing">
                  <Button>Manage Billing</Button>
                </Link>
                <Link href="/dashboard/billing">
                  <Button variant="outline">View Usage</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_meetings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_tasks}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Daily Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streak_days}</div>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                <p className="text-xs text-muted-foreground">Task completion</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created new meeting summary</p>
                    <p className="text-xs text-muted-foreground">Q1 Planning Session • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed task</p>
                    <p className="text-xs text-muted-foreground">Finalize Q1 budget allocation • 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Updated profile</p>
                    <p className="text-xs text-muted-foreground">Changed job title • 1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Delete Account</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={saving}
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : null}
                Delete Account
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
