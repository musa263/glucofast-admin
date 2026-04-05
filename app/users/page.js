'use client';
import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const togglePremium = async (uid, currentStatus) => {
    setActionLoading(uid);
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, isPremium: !currentStatus }),
      });
      setUsers((prev) => prev.map((u) =>
        u.uid === uid ? { ...u, isPremium: !currentStatus } : u
      ));
    } catch {
      // silent
    }
    setActionLoading(null);
  };

  const deleteUser = async (uid, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setActionLoading(uid);
    try {
      await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch {
      // silent
    }
    setActionLoading(null);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-dim)', padding: 40 }}>Loading users...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Users</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{users.length} registered users</p>
        </div>
        <button className="btn-ghost" onClick={loadUsers} style={{ fontSize: 13 }}>Refresh</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Role</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <td style={{ fontWeight: 500 }}>{user.email || '—'}</td>
                <td>{user.displayName || user.name || '—'}</td>
                <td>
                  <span className={user.isPremium ? 'badge badge-purple' : 'badge badge-green'}>
                    {user.isPremium ? 'Premium' : 'Free'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-dim)' }}>{user.role || 'user'}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      className={user.isPremium ? 'btn-ghost' : 'btn-purple'}
                      style={{ fontSize: 12, padding: '6px 12px' }}
                      onClick={() => togglePremium(user.uid, user.isPremium)}
                      disabled={actionLoading === user.uid}
                    >
                      {user.isPremium ? 'Revoke Premium' : 'Grant Premium'}
                    </button>
                    <button
                      className="btn-danger"
                      style={{ fontSize: 12, padding: '6px 12px' }}
                      onClick={() => deleteUser(user.uid, user.email)}
                      disabled={actionLoading === user.uid}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 32 }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
