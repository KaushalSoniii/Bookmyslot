import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'BookMySlot — Appointment Booking',
  description: 'Book appointments with your preferred providers in real-time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark', 'font-sans', geist.variable)}>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}