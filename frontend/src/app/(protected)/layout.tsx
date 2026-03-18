'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Calendar, Clock, BookOpen } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const isClient = user.role === 'client';

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="text-3xl">📅</div>
          <div>
            <p className="font-bold text-2xl">BookMySlot</p>
            <p className="text-xs text-gray-500">Welcome, {user.name}</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {isClient ? (
            <>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/providers')}>
                <Users className="mr-3" /> Browse Providers
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/my-bookings')}>
                <BookOpen className="mr-3" /> My Bookings
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/availability')}>
                <Clock className="mr-3" /> Set Availability
              </Button>
            </>
          )}

          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/schedule')}>
            <Calendar className="mr-3" /> Schedule
          </Button>
        </nav>

        <Button variant="destructive" onClick={logout} className="w-full">
          <LogOut className="mr-2" /> Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  );
}