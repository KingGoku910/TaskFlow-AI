'use client';

import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/error-boundary';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sun, Moon, PanelLeft, Settings, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { AppLogoSvg } from '@/components/common/AppLogoSvg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut as serverSignOut } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<string>('dark');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      document.documentElement.classList.toggle('light', storedTheme === 'light');
    } else {
      // Default to dark mode
      const defaultTheme = 'dark';
      localStorage.setItem('theme', defaultTheme);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setTheme(defaultTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    try {
      await serverSignOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/auth'); 
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  const sidebarStyle = useMemo(() => ({ "--sidebar-width": "200px" } as React.CSSProperties), []);

  return (
    <SidebarProvider defaultOpen style={sidebarStyle}>
      <div id="dashboard-root" className="dashboard-container flex flex-col h-screen w-full">
        <header id="dashboard-header" className="dashboard-header px-4 lg:px-6 h-[10vh] flex items-center border-b bg-background shadow-sm sticky top-0 z-50 w-full">
          <Link href="/dashboard" className="dashboard-logo-link flex items-center justify-center" prefetch={false}>
            <img
              src="https://imgur.com/F8fyOmc.png"
              alt="TaskFlow AI Dashboard"
              className="h-24 w-56 max-w-[340px] object-contain"
            />
            <span className="sr-only">TaskFlow AI Dashboard</span>
          </Link>
          <nav id="dashboard-top-nav" className="dashboard-top-navigation ml-auto flex gap-2 sm:gap-4 items-center">
            <Link href="/" prefetch={false}>
              <Button variant="outline" size="sm" className="landing-page-button">Landing Page</Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="Toggle theme" 
              className="theme-toggle-button text-foreground group"
            >
              {theme === 'light' ? <Moon className="h-5 w-5 group-hover:text-accent-foreground group-hover:text-accent-foreground-hov" /> : <Sun className="h-5 w-5 group-hover:text-accent-foreground group-hover:text-accent-foreground-hov" />}
            </Button>
          </nav>
        </header>
        <div id="dashboard-main-layout" className="dashboard-main-layout flex flex-1 overflow-visible min-h-0 w-full">
          <Sidebar collapsible="icon" className="dashboard-sidebar hidden md:flex h-[97%] m-2.5 glass-container rounded-lg z-[5000] overflow-x-hidden overflow-y-auto flex-col items-center">
            <SidebarContent className="dashboard-sidebar-content flex flex-col pb-4">
              <SidebarHeader className="dashboard-sidebar-header flex justify-center items-center p-2 w-full">
                <SidebarTrigger className="sidebar-toggle md:flex mx-auto" aria-label="Toggle sidebar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <PanelLeft style={{ margin: '0 auto' }} />
                </SidebarTrigger>
              </SidebarHeader>
              <SidebarMenu className="dashboard-sidebar-nav flex-1 flex flex-col items-center justify-center">
                <SidebarNav />
              </SidebarMenu>
              <SidebarFooter className="dashboard-sidebar-footer mt-auto">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/dashboard/settings">
                      <SidebarMenuButton tooltip="Settings" aria-label="Settings" className="settings-menu-button">
                        <Settings className="h-5 w-5" />
                        <span className="sidebar-menu-button-text">Settings</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem className="mb-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          tooltip="Account Options"
                          aria-label="Account Options"
                          className="account-menu-button w-full"
                        >
                          <UserCircle className="h-5 w-5" />
                          <span className="sidebar-menu-button-text flex-grow">Account</span>
                          <ChevronDown className="absolute bottom-1 right-1 h-4 w-4 text-muted-foreground group-data-[state=open]:text-accent-foreground group-data-[state=open]:hover:text-accent-foreground-hov" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="account-dropdown w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile" className="profile-menu-item flex items-center w-full">
                            <UserCircle className="mr-2 h-4 w-4" /> Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="logout-menu-item flex items-center text-destructive focus:text-destructive focus:bg-destructive/10">
                          <LogOut className="mr-2 h-4 w-4" /> Log Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>

                </SidebarMenu>
              </SidebarFooter>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <main id="dashboard-main-content" className="relative flex min-h-0 flex-1 flex-col bg-background overflow-visible px-2 py-4" style={{ height: '90%' }}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <section className="saved-notes-section">
                <div className="thumbnail" style={{ boxShadow: '0 0 10px var(--accent-color)' }}>
                  {/* Thumbnail content */}
                </div>
              </section>
              <section className="saved-meetings-section">
                <div className="thumbnail" style={{ boxShadow: '0 0 10px var(--accent-color)' }}>
                  {/* Thumbnail content */}
                </div>
              </section>
            </main>
          </SidebarInset>
        </div>
        <footer id="dashboard-footer" className="dashboard-footer flex flex-col gap-2 sm:flex-row py-2 h-[5vh] w-full shrink-0 items-center justify-center px-4 md:px-6 border-t bg-accent">
          <p className="footer-copyright text-xs text-accent-foreground">&copy; {new Date().getFullYear()} TaskFlow AI By Innova-TEX AI. All rights reserved.</p>
        </footer>
      </div>
    </SidebarProvider>
  );
}
