'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, CalendarPlus, Clock, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

async function fetchProviders(params: Record<string, string>) {
  const query = new URLSearchParams({ role: 'provider', ...params }).toString();
  const res = await api.get(`/users?${query}`);
  return res.data;
}

function ProviderCard({ provider }: { provider: User }) {
  const router = useRouter();
  const initials = provider.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasAvailability = !!provider.availability;

  return (
    <Card className="group hover:ring-1 hover:ring-primary/30 transition-all cursor-pointer"
      onClick={() => router.push(`/book/${provider._id}`)}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-lg">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm leading-tight">{provider.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{provider.email}</p>
              </div>
              <Badge
                variant={hasAvailability ? 'secondary' : 'outline'}
                className={cn(
                  'shrink-0 text-xs',
                  hasAvailability
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'text-muted-foreground',
                )}
              >
                {hasAvailability ? '● Available' : 'No schedule'}
              </Badge>
            </div>

            {hasAvailability && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {provider.availability!.startHour}:00 –{' '}
                  {provider.availability!.endHour}:00
                </span>
                <span className="mx-1">·</span>
                <span>
                  {provider.availability!.days.slice(0, 3).join(', ')}
                  {provider.availability!.days.length > 3 &&
                    ` +${provider.availability!.days.length - 3}`}
                </span>
              </div>
            )}

            <Button
              size="sm"
              className="mt-3 w-full gap-2 h-8"
              disabled={!hasAvailability}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/book/${provider._id}`);
              }}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Book Appointment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProviderCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40 mt-3" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProvidersPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name:asc');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['providers', search, sort, page],
    queryFn: () =>
      fetchProviders({
        search,
        sort,
        page: String(page),
        limit: '9',
      }),
  });

  const providers: User[] = data?.users ?? [];
  const totalPages: number = data?.totalPages ?? 1;
  const total: number = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Browse Providers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Find and book appointments with available providers
          </p>
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="text-xs">
            {total} providers
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <ProviderCardSkeleton key={i} />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">No providers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'Try a different search term' : 'No providers have registered yet'}
            </p>
          </div>
          {search && (
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map((p) => <ProviderCard key={p._id} provider={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}