'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import { Booking } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from '@/components/ui/card';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function SchedulePage() {
  const { user } = useAuth();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['schedule'],
    queryFn: async () => {
      const res = await api.get('/bookings/schedule');
      return res.data;
    },
  });

  const events = bookings.map((booking) => {
    const otherParty = user?.role === 'client' ? booking.provider : booking.client;

    return {
      id: booking._id,
      title: `${otherParty?.name || 'Meeting'}`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: booking,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'client'
            ? 'Your upcoming and past appointments'
            : 'Your booked appointments and availability overview'}
        </p>
      </div>

      <Card className="overflow-hidden border-gray-800 bg-card">
        <CardContent className="p-0">
          <div style={{ height: '700px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              className="rbc-dark"
              popup
              views={['month', 'week', 'day', 'agenda']}
              defaultView="week"
              step={30}
              timeslots={2}
              eventPropGetter={() => ({
                className: 'bg-primary/80 border-primary text-primary-foreground rounded-md shadow-sm',
              })}
              dayPropGetter={(date) => ({
                className: 'bg-background',
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Optional: Custom dark theme overrides */}
      <style jsx global>{`
        .rbc-dark .rbc-calendar {
          background-color: transparent;
          color: hsl(var(--foreground));
        }
        .rbc-dark .rbc-header {
          background-color: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        }
        .rbc-dark .rbc-time-view .rbc-time-gutter,
        .rbc-dark .rbc-time-header-gutter {
          background-color: hsl(var(--muted));
        }
        .rbc-dark .rbc-day-slot .rbc-time-slot {
          border-bottom: 1px solid hsl(var(--border));
        }
        .rbc-dark .rbc-off-range {
          color: hsl(var(--muted-foreground));
        }
        .rbc-dark .rbc-today {
          background-color: hsl(var(--accent)/0.15);
        }
        .rbc-dark .rbc-event {
          border: none;
        }
        .rbc-dark .rbc-selected {
          background-color: hsl(var(--primary)/0.3);
        }
      `}</style>
    </div>
  );
}