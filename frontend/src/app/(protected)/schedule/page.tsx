'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay'
import { enUS } from 'date-fns/locale';
import { Booking } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';

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
    queryKey: ['schedule', user?._id],
    queryFn: async () => {
      const res = await api.get('/bookings/schedule');
      return res.data;
    },
    enabled: !!user,
  });

  const events = bookings.map((booking) => {
    const otherParty = user?.role === 'client' ? booking.provider : booking.client;

    return {
      title: `${otherParty?.name || 'Appointment'}`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: booking,
    };
  });

  if (isLoading) {
    return <div className="text-center py-20">Loading schedule...</div>;
  }

  if (!events.length) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6 opacity-30">🗓️</div>
        <h2 className="text-2xl font-semibold mb-3">Your schedule is empty</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          {user?.role === 'client'
            ? 'Once you book meetings, they will appear here in calendar view.'
            : 'When clients book time with you, your schedule will fill up here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Schedule</h1>

      <Card className="p-1 bg-gray-950 border-gray-800 overflow-hidden">
        <div style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            className="rbc-dark-theme"
            popup
            views={['month', 'week', 'day']}
            defaultView="week"
            eventPropGetter={(event) => ({
              className: 'bg-blue-600/80 border-blue-500 text-white rounded-md',
            })}
          />
        </div>
      </Card>

      <style jsx global>{`
        .rbc-dark-theme {
          --rbc-background-color: #0f172a;
          --rbc-text-color: #e2e8f0;
          --rbc-border: #334155;
          --rbc-today-color: rgba(59, 130, 246, 0.15);
          --rbc-selected-color: rgba(59, 130, 246, 0.3);
        }
        .rbc-event {
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.9rem;
        }
        .rbc-off-range-bg {
          background: transparent;
        }
      `}</style>
    </div>
  );
}