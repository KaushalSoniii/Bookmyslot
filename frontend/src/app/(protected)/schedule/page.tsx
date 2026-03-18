// app/(protected)/schedule/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Booking, User } from '@/types';
import { useState } from 'react';

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

  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading, error } = useQuery<Booking[]>({
    queryKey: ['schedule', user?._id],
    queryFn: async () => {
      const res = await api.get('/bookings/schedule');
      return res.data;
    },
    enabled: !!user,
  });

  if (error) {
    toast.error('Could not load your schedule');
    return (
      <div className="text-center py-12 text-red-400">
        Something went wrong while loading your appointments.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Card className="h-175 border-gray-800 bg-gray-950">
          <div className="p-6">
            <div className="grid grid-cols-7 gap-px bg-gray-800">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-28 bg-gray-900 rounded-sm" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const events = bookings.map((booking) => {
    const otherParty: User | undefined =
      user?.role === 'client' ? booking.provider : booking.client;

    return {
      id: booking._id,
      title: otherParty?.name || 'Appointment',
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: booking,
    };
  });

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-8xl mb-6 opacity-30">🗓️</div>
        <h2 className="text-3xl font-semibold mb-4">No appointments yet</h2>
        <p className="text-lg text-gray-400 max-w-md">
          {user?.role === 'client'
            ? 'When you book a meeting, it will appear here.'
            : 'When someone books a time slot with you, it will show up on this calendar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'client'
            ? 'Your upcoming and past booked appointments'
            : 'Your booked sessions and availability overview'}
        </p>
      </div>

      <Card className="overflow-hidden border-gray-800 bg-gray-950">
        <div style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            step={30}
            timeslots={2}
            popup
            onSelectEvent={(event) => setSelectedEvent(event.resource as Booking)}
            eventPropGetter={(event) => ({
              className:
                user?.role === 'client'
                  ? 'bg-blue-600/80 border-blue-500 text-white'
                  : 'bg-emerald-600/80 border-emerald-500 text-white',
              style: {
                borderRadius: '6px',
                opacity: 0.9,
                fontSize: '0.95rem',
                padding: '2px 6px',
              },
            })}
            dayPropGetter={() => ({
              className: 'bg-gray-950 text-white hover:bg-gray-900/40 transition-colors',
            })}
            messages={{
              month: 'Month',
              week: 'Week',
              day: 'Day',
              today: 'Today',
              previous: '←',
              next: '→',
              noEventsInRange: 'No appointments in this period',
            }}
          />
        </div>
      </Card>

      {selectedEvent && (
        <div className="mt-6 p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <h3 className="text-xl font-semibold mb-3">Appointment Details</h3>
          <div className="space-y-2 text-gray-300">
            <p>
              <strong>With:</strong>{' '}
              {user?.role === 'client'
                ? selectedEvent.provider?.name
                : selectedEvent.client?.name}
            </p>
            <p>
              <strong>Date:</strong>{' '}
              {format(new Date(selectedEvent.startTime), 'EEEE, MMMM d, yyyy')}
            </p>
            <p>
              <strong>Time:</strong>{' '}
              {format(new Date(selectedEvent.startTime), 'hh:mm a')} –{' '}
              {format(new Date(selectedEvent.endTime), 'hh:mm a')}
            </p>
            <p>
              <strong>Status:</strong> {selectedEvent.status}
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .rbc-calendar {
          color: #e2e8f0;
        }
        .rbc-header {
          background-color: #0f172a;
          border-bottom: 1px solid #334155;
          color: #94a3b8;
        }
        .rbc-time-header-gutter,
        .rbc-time-gutter {
          background-color: #0f172a;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #1e293b;
        }
        .rbc-off-range-bg {
          background: transparent;
        }
        .rbc-today {
          background-color: rgba(59, 130, 246, 0.08);
        }
        .rbc-popup {
          background: #1e293b;
          border: 1px solid #334155;
          color: white;
        }
      `}</style>
    </div>
  );
}