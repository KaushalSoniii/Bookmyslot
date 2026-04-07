'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { parse, startOfWeek, getDay } from 'date-fns';
import { dateFnsLocalizer } from 'react-big-calendar';
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
        <Skeleton className="h-125 w-full rounded-xl" />
      </div>
    ),
  },
);

const locales = { 'en-US': enUS };

async function fetchSchedule() {
  const res = await api.get('/bookings/schedule');
  return res.data as Booking[];
}

export default function SchedulePage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: fetchSchedule,
  });

  const localizer = useMemo(
    () => dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales }),
    [],
  );

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
          <Skeleton className="h-125 w-full rounded-xl" />
        </div>
      ) : (
        <div className="rbc-wrapper rounded-xl border border-border overflow-hidden bg-card">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor={(event: any) => event.start}
            endAccessor={(event: any) => event.end}
            style={{ height: 600 }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            tooltipAccessor={(event: any) => event.title}
            eventPropGetter={() => ({
              className: 'rbc-custom-event',
            })}
          />
        </div>
      )}
    </div>
  );
}