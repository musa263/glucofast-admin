'use client';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: '\u25C9' },
  { label: 'Users', href: '/users', icon: '\u25CE' },
  { label: 'Settings', href: '/settings', icon: '\u2699' },
  { label: 'Blog', href: '/blog', icon: '\u270E' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>GlucoFast</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 20px',
                  fontSize: 14,
                  color: active ? 'var(--accent)' : 'var(--text-dim)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  borderRight: active ? '2px solid var(--accent)' : '2px solid transparent',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ margin: '0 16px', fontSize: 13 }}
        >
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
