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
		<nav
			id="sidebar-navigation"
			className="sidebar-navigation glass-container rounded-lg mx-2.5 my-2.5 mt-2 flex flex-col gap-[15px]"
		>
			{menuItems.map((item) => (
				<Link href={item.href} key={item.href}>
					<SidebarMenuButton
						isActive={pathname === item.href}
						tooltip={item.label}
						aria-label={item.label}
						className={cn(
							'sidebar-nav-button',
							`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`,
							!(pathname === item.href)
								? 'bg-[rgba(255,255,255,0.08)] backdrop-blur-md border border-white/10 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] text-foreground/80 hover:bg-[rgba(255,255,255,0.16)] transition-all'
								: 'bg-teal-400/80 text-white shadow-lg border border-teal-300/60'
						)}
					>
						<item.icon className="nav-icon h-5 w-5" />
						<span className="nav-text truncate sidebar-menu-button-text">
							{item.label}
						</span>
					</SidebarMenuButton>
				</Link>
			))}
		</nav>
	);
}

