'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  CalendarClock,
  Users,
  CalendarDays,
  BookOpen,
  Clock,
  LogOut,
  Menu,
  X,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  {
    href: '/providers',
    label: 'Browse Providers',
    icon: Users,
    roles: ['client'],
  },
  {
    href: '/my-bookings',
    label: 'My Bookings',
    icon: BookOpen,
    roles: ['client', 'provider'],
  },
  {
    href: '/schedule',
    label: 'My Schedule',
    icon: CalendarDays,
    roles: ['client', 'provider'],
  },
  {
    href: '/availability',
    label: 'My Availability',
    icon: Clock,
    roles: ['provider'],
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const filtered = navItems.filter((item) =>
    item.roles.includes(user?.role ?? ''),
  );

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <CalendarClock className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-base tracking-tight">BookMySlot</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex w-64 flex-col border-r border-border bg-card p-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">BookMySlot</span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}