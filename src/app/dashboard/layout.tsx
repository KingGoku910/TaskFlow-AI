
'use client';

import type { ReactNode } from 'react';
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
            <AppLogoSvg className="h-7 w-7 text-primary" />
            <span className="sr-only">Effecto TaskFlow Dashboard</span>
            <span className="dashboard-logo-text ml-2 text-xl font-bold text-foreground">Effecto TaskFlow</span>
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
        <div id="dashboard-main-layout" className="dashboard-main-layout flex flex-1 overflow-hidden min-h-0 h-[85vh] w-full">
          <Sidebar collapsible="icon" className="dashboard-sidebar hidden md:flex border-r min-h-0">
            <SidebarContent className="dashboard-sidebar-content flex flex-col">
              <SidebarHeader className="dashboard-sidebar-header flex items-center justify-between p-2">
                <Link href="/dashboard" className="dashboard-sidebar-logo flex items-center group-data-[state=collapsed]:hidden" prefetch={false}>
                  <AppLogoSvg className="h-7 w-7 text-primary" />
                  <span className="ml-2 text-lg font-semibold text-foreground group-data-[state=collapsed]:hidden">Effecto</span>
                </Link>
                <SidebarTrigger className="sidebar-toggle md:flex" aria-label="Toggle sidebar">
                  <PanelLeft />
                </SidebarTrigger>
              </SidebarHeader>
              <div className="dashboard-sidebar-nav flex-1">
                <SidebarMenu>
                  <SidebarNav />
                </SidebarMenu>
              </div>
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
                  
                  <SidebarMenuItem className="mb-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          tooltip="Account Options"
                          aria-label="Account Options"
                          className="account-menu-button w-full justify-start"
                        >
                          <UserCircle className="h-5 w-5" />
                          <span className="sidebar-menu-button-text flex-grow">Account</span>
                          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground group-data-[state=open]:text-accent-foreground group-data-[state=open]:hover:text-accent-foreground-hov sidebar-menu-button-text" />
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
            <main id="dashboard-main-content" className="dashboard-main-content pt-2.5 px-2.5 pb-0">
              {children}
            </main>
          </SidebarInset>
        </div>
        <footer id="dashboard-footer" className="dashboard-footer flex flex-col gap-2 sm:flex-row py-2 h-[5vh] w-full shrink-0 items-center justify-center px-4 md:px-6 border-t bg-accent">
          <p className="footer-copyright text-xs text-accent-foreground">&copy; {new Date().getFullYear()} Effecto TaskFlow. All rights reserved.</p>
        </footer>
      </div>
    </SidebarProvider>
  );
}
