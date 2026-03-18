// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Users, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/10 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            Simple • Secure • Free
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-linear-to-b from-primary to-primary/70 bg-clip-text text-transparent">
            BookMySlot
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Effortless appointment scheduling between clients and providers.
            <br className="hidden sm:block" />
            No more endless emails or phone tag.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg">
              <Link href="/login">
                Get Started – It's Free
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
              <Link href="/login">
                Already have an account? Login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background border-y">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How BookMySlot Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple flow for both clients and service providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Clients</CardTitle>
                <CardDescription className="text-base">
                  Find and book the perfect time slot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p>Browse available providers</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <p>See real-time availability & free slots</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p>Book instantly – 30-minute slots</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <p>Get confirmation email immediately</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 md:scale-105 md:shadow-2xl">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Providers</CardTitle>
                <CardDescription className="text-base">
                  Control your schedule with ease
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <p>Set your working days & hours</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p>Automatic slot blocking after booking</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p>See who booked and when</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <p>Instant email notifications for new bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Core Features</CardTitle>
                <CardDescription className="text-base">
                  Built for reliability & convenience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <p>Double-booking prevention</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <p>Calendar & list views</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <p>Confirmation emails to both parties</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p>Easy cancellation from dashboard</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to simplify your scheduling?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands who already save hours every week with smarter booking.
          </p>

          <Button size="lg" className="h-14 px-10 text-lg">
            <Link href="/login">
              Start Now – It's Free
            </Link>
          </Button>
          
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}