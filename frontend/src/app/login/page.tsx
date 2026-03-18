'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Lock } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'provider']).optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, data);
      login(res.data.access_token, res.data.user);
      toast.success('Login successful!');
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md p-10 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-4xl">📅</span>
          </div>
          <h1 className="text-4xl font-bold text-white">BookMySlot</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isRegister && (
            <>
              <div>
                <Label>Name</Label>
                <Input {...register('name')} placeholder="John Doe" />
              </div>
              <div>
                <Label>Role</Label>
                <Select onValueChange={(v) => setValue('role', v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email')} placeholder="you@email.com" />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" {...register('password')} placeholder="••••••••" />
          </div>

          <Button type="submit" className="w-full text-lg py-6">
            {isRegister ? 'Create Account' : 'Login'}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          {isRegister ? 'Already have account?' : "Don't have account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-400 underline">
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}