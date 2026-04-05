'use client';

export default function DashboardError({ error, reset }) {
  return (
    <div style={{ padding: 40, color: '#FF6B6B' }}>
      <h2 style={{ marginBottom: 12 }}>Dashboard Error</h2>
      <pre style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', marginBottom: 16 }}>
        {error?.message || 'Unknown error'}
        {'\n\n'}
        {error?.stack || ''}
      </pre>
      <button onClick={reset} style={{ background: '#3DFBB0', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        Try Again
      </button>
    </div>
  );
}
