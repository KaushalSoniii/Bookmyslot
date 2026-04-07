'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CalendarDays, Clock, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

async function fetchMyBookings() {
  const res = await api.get('/bookings/my-bookings');
  return res.data;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
  });

  const bookings: Booking[] = data?.bookings ?? [];

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      toast.success('Booking cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      setCancelTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your upcoming and past appointments
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your appointments will appear here once you make a booking.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const other =
              user?.role === 'client' ? booking.provider : booking.client;
            const otherName =
              typeof other === 'object' && other !== null
                ? (other as any).name
                : 'Unknown';
            const isCancelled = booking.status === 'cancelled';
            const isPast = new Date(booking.endTime) < new Date();

            return (
              <Card
                key={booking._id}
                className={cn(
                  'transition-all',
                  isCancelled && 'opacity-60',
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                          {otherName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight">{otherName}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user?.role === 'client' ? 'Provider' : 'Client'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {format(new Date(booking.startTime), 'EEE, MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(booking.startTime), 'h:mm a')} –{' '}
                          {format(new Date(booking.endTime), 'h:mm a')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs capitalize',
                          statusColors[booking.status] ?? '',
                        )}
                      >
                        {booking.status}
                      </Badge>

                      {!isCancelled && !isPast && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelTarget(booking)}
                          className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>
                  Your appointment on{' '}
                  <strong>
                    {format(new Date(cancelTarget.startTime), 'EEEE, MMM d')}
                  </strong>{' '}
                  at{' '}
                  <strong>
                    {format(new Date(cancelTarget.startTime), 'h:mm a')}
                  </strong>{' '}
                  will be cancelled. This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget._id)}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Yes, cancel booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}