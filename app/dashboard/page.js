'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, settingsRes, blogRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/settings'),
          fetch('/api/blog'),
        ]);
        const users = usersRes.ok ? await usersRes.json() : { users: [] };
        const settings = settingsRes.ok ? await settingsRes.json() : { settings: {} };
        const blog = blogRes.ok ? await blogRes.json() : { posts: [] };

        const userList = users.users || [];
        const premiumCount = userList.filter((u) => u.isPremium).length;
        const publishedPosts = (blog.posts || []).filter((p) => p.published).length;

        setStats({
          totalUsers: userList.length,
          premiumUsers: premiumCount,
          freeUsers: userList.length - premiumCount,
          totalPosts: (blog.posts || []).length,
          publishedPosts,
          pricing: settings.settings?.pricing || {},
          ai: settings.settings?.ai || {},
        });
      } catch {
        setStats(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-dim)', padding: 40 }}>Loading dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ color: 'var(--danger)', padding: 40 }}>Failed to load dashboard data. Check your session.</div>;
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'var(--accent)' },
    { label: 'Premium Users', value: stats.premiumUsers, color: 'var(--purple)' },
    { label: 'Free Users', value: stats.freeUsers, color: 'var(--text-dim)' },
    { label: 'Blog Posts', value: `${stats.publishedPosts}/${stats.totalPosts}`, color: 'var(--warn)' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 28 }}>GlucoFast admin overview</p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Quick info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Pricing</div>
          {stats.pricing.tiers ? stats.pricing.tiers.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span>{t.name}</span>
              <span style={{ color: 'var(--accent)' }}>{t.price === 0 ? 'Free' : `$${t.price}/${t.interval}`}</span>
            </div>
          )) : <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No pricing configured</div>}
        </div>

        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI Configuration</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            <div style={{ marginBottom: 6 }}>Model: <span style={{ color: 'var(--text)' }}>{stats.ai.model || 'Not set'}</span></div>
            <div>Max Tokens: <span style={{ color: 'var(--text)' }}>{stats.ai.maxTokens || 'Not set'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
