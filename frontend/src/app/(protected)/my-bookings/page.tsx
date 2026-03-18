'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CalendarDays, Clock, User, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Booking } from '@/types';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['my-bookings', user?._id],
    queryFn: async () => {
      const res = await api.get('/bookings/my-bookings');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredBookings = bookings.filter((booking) => {
    const otherParty = user?.role === 'client' ? booking.provider : booking.client;
    const nameMatch = otherParty?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === 'all' || booking.status === statusFilter;

    return nameMatch && statusMatch;
  });

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel booking');
    },
  });

  if (isLoading) {
    return <BookingsLoadingSkeleton />;
  }

  if (!bookings?.length) {
    return (
      <div className="text-center py-20">
        <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-3">No bookings found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {user?.role === 'client'
            ? 'When you book a meeting with a provider, it will appear here.'
            : 'When clients book time slots with you, they will show up here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-45">Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>
                {user?.role === 'client' ? 'Provider' : 'Client'}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No bookings match your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => {
                const otherParty =
                  user?.role === 'client' ? booking.provider : booking.client;
                const start = new Date(booking.startTime);
                const end = new Date(booking.endTime);

                return (
                  <TableRow key={booking._id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {format(start, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(start, 'hh:mm a')} – {format(end, 'hh:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{otherParty?.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-45">
                            {otherParty?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          booking.status === 'confirmed'
                            ? 'bg-green-950/30 text-green-400 border-green-800'
                            : 'bg-amber-950/30 text-amber-400 border-amber-800'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'confirmed' && (
                        <CancelConfirmationDialog
                          booking={booking}
                          otherParty={otherParty}
                          onConfirm={() => cancelBooking.mutate(booking._id)}
                          isCancelling={cancelBooking.isPending}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CancelConfirmationDialog({
  booking,
  otherParty,
  onConfirm,
  isCancelling,
}: {
  booking: Booking;
  otherParty: any;
  onConfirm: () => void;
  isCancelling: boolean;
}) {
  const start = new Date(booking.startTime);

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking?</DialogTitle>
          <DialogDescription>
            This will permanently cancel the appointment. Both parties will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 border-y">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{otherParty?.name}</p>
              <p className="text-sm text-muted-foreground">{otherParty?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{format(start, 'EEEE, MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(start, 'hh:mm a')} – {format(new Date(booking.endTime), 'hh:mm a')}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="w-full sm:w-auto">
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isCancelling}
            className="w-full sm:w-auto"
          >
            {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-45"><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-28" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}