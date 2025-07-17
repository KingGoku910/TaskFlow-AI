
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Brain, ClipboardList, BarChart3, Mic, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/dashboard/note-generator', label: 'AI Note Generator', icon: Brain },
  { href: '/dashboard/meeting-summaries', label: 'Meeting Summaries', icon: Mic },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav id="sidebar-navigation" className="sidebar-navigation">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href} className="sidebar-nav-item">
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
              aria-label={item.label}
              className={cn(
                "sidebar-nav-button",
                `nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`
              )}
            >
              <item.icon className="nav-icon h-5 w-5" />
              <span className="nav-text truncate sidebar-menu-button-text">
                {item.label}
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </nav>
  );
}

