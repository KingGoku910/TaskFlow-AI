
'use client';

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { AppLogoSvg } from '@/components/common/AppLogoSvg';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to dark theme
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      <header className="absolute top-0 left-0 right-0 px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-sm shadow-sm z-50">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <AppLogoSvg className="h-7 w-7 text-primary" />
          <span className="sr-only">TaskFlow AI</span>
          <span className="ml-2 text-xl font-bold text-foreground">TaskFlow AI</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-foreground group">
            {theme === 'light' ? <Moon className="h-5 w-5 group-hover:text-accent-foreground group-hover:text-accent-foreground-hov" /> : <Sun className="h-5 w-5 group-hover:text-accent-foreground group-hover:text-accent-foreground-hov" />}
          </Button>
        </nav>
      </header>
      {/* Content wrapper ensures content starts below the header and is centered */}
      <div className="flex-1 flex flex-col items-center justify-center pt-16 p-4">
        <main className="w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
