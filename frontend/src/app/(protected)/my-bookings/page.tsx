'use client';

import { useQuery } from '@tanstack/react-query';
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
import { format } from 'date-fns';
import { Calendar, Clock, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Booking, User as UserType } from '@/types';

export default function MyBookingsPage() {
  const { user } = useAuth();

  const { data: bookings = [], isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ['my-bookings', user?._id],
    queryFn: async () => {
      const res = await api.get('/bookings/my-bookings');
      return res.data;
    },
    enabled: !!user,
  });

  const cancelMutation = async (bookingId: string) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">Loading your bookings...</div>;
  }

  if (!bookings.length) {
    return (
      <div className="text-center py-20">
        <Calendar className="mx-auto h-16 w-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No bookings yet</h2>
        <p className="text-gray-500">
          {user?.role === 'client'
            ? 'Start by browsing providers and booking a meeting.'
            : 'No one has booked any time slots with you yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {user?.role === 'client' ? 'As Client' : 'As Provider'}
        </Badge>
      </div>

      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>
                {user?.role === 'client' ? 'Provider' : 'Client'}
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const otherParty = user?.role === 'client' ? booking.provider : booking.client;
              const start = new Date(booking.startTime);
              const end = new Date(booking.endTime);

              return (
                <TableRow key={booking._id} className="hover:bg-gray-900/50">
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                      <User size={20} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{otherParty?.name}</TableCell>
                  <TableCell>{format(start, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {format(start, 'hh:mm a')} – {format(end, 'hh:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-600/20 text-green-400 hover:bg-green-600/30">
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      onClick={() => cancelMutation(booking._id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}