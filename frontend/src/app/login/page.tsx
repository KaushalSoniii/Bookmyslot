'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { CalendarClock, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'provider']),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client' },
  });

  const onLogin = async (values: LoginForm) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', values);
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/providers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (values: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', values);
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome to BookMySlot, ${res.data.user.name}!`);
      router.push('/providers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex-col items-center justify-center p-12 border-r border-border">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <CalendarClock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">BookMySlot</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The smarter way to schedule appointments. Book with providers, manage your time, and never miss a meeting.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'Real-time', sub: 'Availability' },
              { label: 'Instant', sub: 'Confirmation' },
              { label: 'Email', sub: 'Notifications' },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo on mobile */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <CalendarClock className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold">BookMySlot</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode('login')}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                mode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Create Account
            </button>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {mode === 'login' ? 'Welcome back' : 'Get started'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Enter your credentials to access your account'
                  : 'Create your account to start booking appointments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10"
                        {...loginForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full h-10 mt-2" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="John Smith" {...registerForm.register('name')} />
                    {registerForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="you@example.com" {...registerForm.register('email')} />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className="pr-10"
                        {...registerForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['client', 'provider'] as const).map((r) => (
                        <label
                          key={r}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                            registerForm.watch('role') === r
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-border/80',
                          )}
                        >
                          <input
                            type="radio"
                            value={r}
                            className="sr-only"
                            {...registerForm.register('role')}
                          />
                          <span className="text-2xl">{r === 'client' ? '🙋' : '👔'}</span>
                          <span className="text-sm font-medium capitalize">{r}</span>
                          <span className="text-xs text-muted-foreground text-center">
                            {r === 'client' ? 'Book appointments' : 'Accept bookings'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-10 mt-2" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}