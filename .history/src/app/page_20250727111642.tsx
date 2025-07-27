
'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sun, Moon, LogOut } from "lucide-react";
import { AppLogoSvg } from '@/components/common/AppLogoSvg';

import { HeroSection } from '@/components/landing/sections/HeroSection';
import { FeaturesOverviewSection } from '@/components/landing/sections/FeaturesOverviewSection';
import { FeatureDetailsSection } from '@/components/landing/sections/FeatureDetailsSection';
import { PricingSection } from '@/components/landing/sections/PricingSection';
import { CtaSection } from '@/components/landing/sections/CtaSection';
import { FooterSection } from '@/components/landing/sections/FooterSection';
import { LdgSpan } from '@/components/landing/elements/LdgSpan';

import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signOut as serverSignOut } from '@/app/auth/actions';

export default function LandingPage() {
  const [theme, setTheme] = useState<string>('dark');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    
    const supabase = createClient();
    
    // Check for password reset flow in URL fragment
    const handlePasswordReset = () => {
      const hash = window.location.hash;
      if (hash.includes('type=recovery')) {
        // Extract the access token and other params from the hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (accessToken && type === 'recovery') {
          // Set the session with the tokens
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          }).then(() => {
            // Redirect to password reset page
            router.push('/auth/reset-password');
          }).catch((error: any) => {
            console.error('Error setting session:', error);
            toast({
              title: "Error",
              description: "Failed to process password reset link. Please try again.",
              variant: "destructive"
            });
          });
          return;
        }
      }
    };
    
    // Handle password reset on initial load
    handlePasswordReset();
    
    // Get initial session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    if (!isClient) return;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      document.documentElement.classList.toggle('light', storedTheme === 'light');
    } else {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await serverSignOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background shadow-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <img
            src="https://imgur.com/F8fyOmc.png"
            alt="TaskFlow AI"
            className="h-24 w-56 max-w-[340px] object-contain"
          />
          <span className="sr-only">TaskFlow AI</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Features
          </Link>
          <Link href="#feature-details" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Details
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Pricing
          </Link>
          {currentUser ? (
            <>
             <Link href="/dashboard" prefetch={false}>
                <Button size="sm" variant="outline">Dashboard</Button>
              </Link>
             <Button size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
            </>
          ) : (
            <Link href="/auth" prefetch={false}>
              <Button size="sm">Get Started</Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-foreground group">
            {theme === 'light' ? <Moon className="h-5 w-5 group-hover:text-accent-foreground group-hover:text-accent-foreground-hov" /> : <Sun className="h-5 w-5 group-hover:text-accent-foreground group-hover:text-accent-foreground-hov" />}
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <HeroSection />
        <FeaturesOverviewSection />
        <FeatureDetailsSection />
        <PricingSection />
        <CtaSection />
      </main>

      <FooterSection />
    </div>
  );
}
