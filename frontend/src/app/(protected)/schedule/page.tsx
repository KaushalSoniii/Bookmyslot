'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { Booking } from '@/types/index';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

// Dynamic import — calendar is NOT loaded on first page render
// This reduces initial bundle by ~120KB
const BigCalendar = dynamic(
  () => import('react-big-calendar').then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    ),
  },
);

// Dynamic import for localizer too
const { dateFnsLocalizer } = await import('react-big-calendar').catch(() => ({ dateFnsLocalizer: null }));

import localeData from 'date-fns/locale/en-US';
import { parse, startOfWeek, getDay } from 'date-fns';

const locales = { 'en-US': localeData };

async function fetchSchedule() {
  const res = await api.get('/bookings/schedule');
  return res.data as Booking[];
}

export default function SchedulePage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: fetchSchedule,
  });

  const localizer = useMemo(() => {
    try {
      const { dateFnsLocalizer: loc } = require('react-big-calendar');
      return loc({ format, parse, startOfWeek, getDay, locales });
    } catch {
      return null;
    }
  }, []);

  const events = useMemo(
    () =>
      bookings.map((b) => ({
        id: b._id,
        title:
          typeof b.provider === 'object'
            ? `With ${(b.provider as any).name}`
            : `Booking`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        resource: b,
      })),
    [bookings],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          My Schedule
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your confirmed bookings in calendar view
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      ) : !localizer ? (
        <div className="text-center py-20 text-muted-foreground">
          Calendar failed to load. Please refresh the page.
        </div>
      ) : (
        <div className="rbc-wrapper rounded-xl border border-border overflow-hidden bg-card">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            tooltipAccessor={(event) => event.title}
            eventPropGetter={() => ({
              className: 'rbc-custom-event',
            })}
          />
        </div>
      )}
    </div>
  );
}