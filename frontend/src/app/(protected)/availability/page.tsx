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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Clock, CalendarDays, Save, CalendarClock, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const formSchema = z
  .object({
    days: z.array(z.string()).min(1, 'Select at least one day'),
    startHour: z.number().min(0).max(23),
    endHour: z.number().min(1).max(24),
  })
  .refine((data) => data.endHour > data.startHour, {
    message: 'End time must be after start time',
    path: ['endHour'],
  });

type AvailabilityForm = z.infer<typeof formSchema>;

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function hourLabel(h: number) {
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

async function fetchCurrentAvailability() {
  const res = await api.get('/users/me');
  return res.data;
}

export default function AvailabilityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user?.role !== 'provider') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Only providers can manage availability.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/providers')}>
          Back to Providers
        </Button>
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
      startHour: 9,
      endHour: 17,
    },
  });

  const onSubmit = async (values: AvailabilityForm) => {
    setIsSubmitting(true);
    try {
      await api.patch('/users/me/availability', {
        days: values.days,
        startHour: values.startHour,
        endHour: values.endHour,
      });
      toast.success('Availability updated!');
      form.reset(values);
      queryClient.invalidateQueries({ queryKey: ['current-availability'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Availability</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Set the days and hours when clients can book with you
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Working Hours</CardTitle>
              <CardDescription>When are you available for appointments?</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Days */}
              <FormField
                control={form.control}
                name="days"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Available Days
                    </FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const selected = field.value.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const newDays = selected
                                ? field.value.filter((d: string) => d !== day)
                                : [...field.value, day];
                              field.onChange(newDays);
                            }}
                            className={cn(
                              'rounded-full px-4 py-1.5 text-sm font-medium transition-all border',
                              selected
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                            )}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hours */}
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel className="text-base">Start Hour</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                        >
                          {HOURS.slice(0, 23).map((h) => (
                            <option key={h} value={h}>{hourLabel(h)}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel className="text-base">End Hour</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                        >
                          {HOURS.slice(1).map((h) => (
                            <option key={h} value={h}>{hourLabel(h)}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : 'Save Availability'}
              </Button>
            </form>
          </Form>

          {/* Current saved availability */}
          <div className="pt-8 mt-8 border-t border-border">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Current Saved Availability
            </h3>

            {isLoadingCurrent ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : currentAvail?.availability ? (
              <div className="bg-muted/50 border border-border rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Available on</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentAvail.availability.days.map((day: string) => (
                        <Badge key={day} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {day.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Hours</p>
                    <p className="text-lg font-semibold">
                      {hourLabel(currentAvail.availability.startHour)} –{' '}
                      {hourLabel(currentAvail.availability.endHour)}
                    </p>
                  </div>
                </div>
                {currentAvail.updatedAt && (
                  <p className="text-xs text-muted-foreground mt-4 text-right">
                    Last updated: {format(new Date(currentAvail.updatedAt), 'MMM d, yyyy • h:mm a')}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
                <CalendarClock className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No availability set yet. Fill in the form above to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}