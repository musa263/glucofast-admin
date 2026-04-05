'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ background: '#080C0B', color: '#FF6B6B', fontFamily: 'monospace', padding: 40 }}>
        <h2>Something went wrong</h2>
        <pre style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', marginBottom: 16, color: '#E8F5F0' }}>
          {error?.message || 'Unknown error'}
          {'\n\n'}
          {error?.digest || ''}
          {'\n\n'}
          {error?.stack || ''}
        </pre>
        <button onClick={reset} style={{ background: '#3DFBB0', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Try Again
        </button>
      </body>
    </html>
  );
}
