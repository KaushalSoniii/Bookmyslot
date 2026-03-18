'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, CalendarDays, Save, CalendarClock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  days: z.array(z.string()).min(1, 'Select at least one day'),
  startTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
}).refine(
  (data) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes > startMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

type AvailabilityForm = z.infer<typeof formSchema>;

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

async function fetchCurrentAvailability() {
  const res = await api.get('/users/me');
  return res.data;
}

export default function AvailabilityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (user?.role !== 'provider') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold mb-4">Access Restricted</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Only providers can set their availability.
        </p>
        <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const { data: currentAvail, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['current-availability'],
    queryFn: fetchCurrentAvailability,
  });

  const form = useForm<AvailabilityForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: [],
      startTime: '09:00',
      endTime: '17:00',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: AvailabilityForm) => {
    setIsSubmitting(true);

    try {
      const [startHour] = values.startTime.split(':').map(Number);
      const [endHour] = values.endTime.split(':').map(Number);

      await api.patch('/users/me/availability', {
        days: values.days,
        startHour,
        endHour,
      });

      toast.success('Availability updated successfully!');
      form.reset(values);

      queryClient.invalidateQueries({ queryKey: ['current-availability'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Card className="border-gray-800 bg-gray-950 shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">Manage Your Availability</CardTitle>
              <CardDescription className="mt-2 text-base">
                Set the days and hours when clients can book appointments with you
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-10">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <FormField
                control={form.control}
                name="days"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Available Days
                    </FormLabel>
                    <div className="flex flex-wrap gap-2.5">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={field.value.includes(day) ? 'default' : 'outline'}
                          className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                            field.value.includes(day)
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-primary/10 border-gray-700'
                          }`}
                          onClick={() => {
                            const newDays = field.value.includes(day)
                              ? field.value.filter((d: string) => d !== day)
                              : [...field.value, day];
                            field.onChange(newDays);
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel className="text-base">Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel className="text-base">End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-medium"
                  disabled={isSubmitting || !form.formState.isDirty}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving Availability...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="pt-10 border-t border-gray-800">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              Current Saved Availability
            </h3>

            {isLoadingCurrent ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : currentAvail?.availability ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Available on</p>
                    <div className="flex flex-wrap gap-2">
                      {currentAvail.availability.days.map((day: string) => (
                        <Badge key={day} variant="secondary" className="px-3 py-1 bg-primary/20 text-primary">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Time Range</p>
                    <p className="text-xl font-medium">
                      {currentAvail.availability.startHour}:00 – {currentAvail.availability.endHour}:00
                    </p>
                  </div>
                </div>

                {currentAvail.updatedAt && (
                  <p className="text-xs text-gray-500 mt-4 text-center sm:text-right">
                    Last updated: {format(new Date(currentAvail.updatedAt), 'MMM d, yyyy • hh:mm a')}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-8 text-center">
                <CalendarClock className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h4 className="text-lg font-medium mb-2">No availability set yet</h4>
                <p className="text-gray-500">
                  Set your working days and hours above to start receiving bookings.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}