'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User } from '@/types';
import Link from 'next/link';

export default function ProvidersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('provider');
  const [sort, setSort] = useState('name:asc');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter, sort],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: { page, limit: 10, search, role: roleFilter, sort },
      });
      return res.data;
    },
  });

  if (user?.role !== 'client') return <div className="text-center text-2xl mt-20">Only clients can browse providers</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Available Providers</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input placeholder="Search name/email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-80" />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name:asc">Name A-Z</SelectItem>
            <SelectItem value="name:desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u: User) => (
            <TableRow key={u._id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Link href={`/book/${u._id}`}>
                  <Button>Book Meeting</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination buttons */}
      <div className="flex gap-4 mt-8">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}