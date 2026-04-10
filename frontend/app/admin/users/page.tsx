'use client';

import { useEffect, useState } from 'react';
import apiClient from '../../../lib/apiClient';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'admin')) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.role === 'admin') fetchUsers();
  }, [session]);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch {
      toast.error('Failed to update role');
    }
  };

  if (loading) return <div>Loading Admin Panel...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>User Management</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Name</th>
            <th style={{ padding: '0.5rem' }}>Email</th>
            <th style={{ padding: '0.5rem' }}>Role</th>
            <th style={{ padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{user.name}</td>
              <td style={{ padding: '0.5rem' }}>{user.email}</td>
              <td style={{ padding: '0.5rem' }}>
                <span
                  style={{
                    padding: '0.2rem 0.5rem',
                    backgroundColor: user.role === 'admin' ? '#ffebee' : '#e0f7fa',
                    color: user.role === 'admin' ? '#c62828' : '#006064',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                  }}
                >
                  {user.role}
                </span>
              </td>
              <td style={{ padding: '0.5rem' }}>
                <button
                  onClick={() => handleRoleChange(user.id, user.role)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                  disabled={user.email === session?.user?.email} // Prevents demoting oneself
                >
                  {user.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
