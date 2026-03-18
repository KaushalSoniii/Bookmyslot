'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export default function BookPage() {
  const { providerId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: slots = [] } = useQuery({
    queryKey: ['availability', providerId, selectedDate],
    queryFn: async () => {
      const res = await api.get(`/bookings/availability/${providerId}`, {
        params: { date: format(selectedDate, 'yyyy-MM-dd') },
      });
      return res.data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (slot: any) => {
        return await api.post('/bookings', {
        providerId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        });
    },
    onSuccess: () => {
        console.log('SUCCESS TRIGGERED');
        toast.success('Booking confirmed! Email sent to both.');
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
        setSelectedSlot(null);
    },
    onError: (err: any) => {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Booking failed');
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">Book a Meeting</h1>

      <div className="flex gap-12">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-xl border border-gray-800"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-xl mb-4">Available Slots on {format(selectedDate, 'PPP')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {slots.length === 0 ? (
              <p>No slots available</p>
            ) : (
              slots.map((slot: any, i: number) => (
                <Button
                  key={i}
                  variant={selectedSlot === slot.startTime ? 'default' : 'outline'}
                  onClick={() => setSelectedSlot(slot.startTime)}
                  className="justify-start h-auto py-6"
                >
                  {format(new Date(slot.startTime), 'hh:mm a')} - {format(new Date(slot.endTime), 'hh:mm a')}
                </Button>
              ))
            )}
          </div>

          {selectedSlot && (
            <Button
              onClick={() => bookMutation.mutate({ startTime: selectedSlot, endTime: slots.find((s: any) => s.startTime === selectedSlot)?.endTime })}
              className="w-full mt-8 text-lg"
              disabled={bookMutation.isPending}
            >
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}