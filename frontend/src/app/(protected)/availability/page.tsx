'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const schema = z.object({
  days: z.array(z.string()),
  startHour: z.number(),
  endHour: z.number(),
});

type FormData = z.infer<typeof schema>;

export default function AvailabilityPage() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { days: ['Monday', 'Tuesday'], startHour: 9, endHour: 17 },
  });

  const onSubmit = async (data: FormData) => {
    await api.patch('/users/me/availability', data);
    toast.success('Availability updated!');
  };

  return (
    <div className="max-w-md">
      <h1 className="text-4xl font-bold mb-8">Set My Availability</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Multi-select days + start/end hour inputs using shadcn */}
        <Button type="submit" className="w-full">Save Availability</Button>
      </form>
    </div>
  );
}