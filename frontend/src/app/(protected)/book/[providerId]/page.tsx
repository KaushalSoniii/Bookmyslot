'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, CalendarDays, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Slot = { startTime: string; endTime: string };

export default function BookPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Fetch provider info
  const { data: providerData } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const res = await api.get(`/users?role=provider`);
      return res.data.users?.find((u: any) => u._id === providerId);
    },
  });

  // Fetch available slots for selected date
  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', providerId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await api.get(`/bookings/availability/${providerId}?date=${dateStr}`);
      return res.data as Slot[];
    },
    enabled: !!selectedDate,
  });

  // Book mutation
  const bookMutation = useMutation({
    mutationFn: (slot: Slot) =>
      api.post('/bookings', {
        providerId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }),
    onSuccess: () => {
      toast.success('Appointment booked! Confirmation email sent.');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots', providerId, selectedDate] });
      router.push('/my-bookings');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to book. Try another slot.');
    },
  });

  const providerName = providerData?.name ?? 'Provider';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          with <span className="text-foreground font-medium">{providerName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Select Date
            </CardTitle>
            <CardDescription>Choose your preferred appointment date</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Available Slots
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? `Slots for ${format(selectedDate, 'EEEE, MMM d')}`
                : 'Select a date to see slots'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Pick a date first</p>
              </div>
            ) : slotsLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Clock className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No slots available</p>
                <p className="text-xs text-muted-foreground">Try a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(isSelected ? null : slot)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted',
                      )}
                    >
                      {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                      {format(new Date(slot.startTime), 'h:mm a')}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Button */}
      {selectedSlot && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">Ready to confirm?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(selectedSlot.startTime), 'EEEE, MMM d')} at{' '}
                {format(new Date(selectedSlot.startTime), 'h:mm a')} –{' '}
                {format(new Date(selectedSlot.endTime), 'h:mm a')}
              </p>
            </div>
            <Button
              onClick={() => bookMutation.mutate(selectedSlot)}
              disabled={bookMutation.isPending}
              className="gap-2"
            >
              {bookMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirm Booking
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}