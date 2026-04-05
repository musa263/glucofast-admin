'use client';
import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  pricing: {
    tiers: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['7-day history', '3 reminders', 'Basic alerts'] },
      { id: 'premium_monthly', name: 'Premium Monthly', price: 6.99, interval: 'month', features: ['Full history', 'Unlimited reminders', 'Smart insights', 'Bedtime analysis', 'Food rankings', 'Reports'] },
      { id: 'premium_yearly', name: 'Premium Yearly', price: 49.99, interval: 'year', features: ['Everything in Premium', '40% savings'] },
    ],
  },
  ai: { model: 'claude-sonnet-4-20250514', maxTokens: 1024 },
  app: { maintenanceMode: false, minVersion: '1.0.0' },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && Object.keys(data.settings).length > 0) {
            const s = data.settings;
            setSettings((prev) => ({
              pricing: {
                tiers: s.pricing?.tiers || prev.pricing.tiers,
              },
              ai: { ...prev.ai, ...s.ai },
              app: { ...prev.app, ...s.app },
            }));
          }
        }
      } catch {
        // use defaults
      }
      setLoading(false);
    }
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // silent
    }
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateTier = (idx, field, value) => {
    setSettings((prev) => {
      const tiers = prev.pricing.tiers.map((t, i) =>
        i === idx ? { ...t, [field]: field === 'price' ? parseFloat(value) || 0 : value } : t
      );
      return { ...prev, pricing: { ...prev.pricing, tiers } };
    });
  };

  const updateTierFeatures = (idx, featuresStr) => {
    setSettings((prev) => {
      const tiers = prev.pricing.tiers.map((t, i) =>
        i === idx ? { ...t, features: featuresStr.split('\n').filter(Boolean) } : t
      );
      return { ...prev, pricing: { ...prev.pricing, tiers } };
    });
  };

  if (loading) {
    return <div style={{ color: 'var(--text-dim)', padding: 40 }}>Loading settings...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Pricing, AI, and app configuration</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--accent)', fontSize: 13 }}>Saved!</span>}
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Pricing Tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {settings.pricing.tiers.map((tier, idx) => (
            <div key={tier.id} style={{ background: 'var(--surface)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  value={tier.name}
                  onChange={(e) => updateTier(idx, 'name', e.target.value)}
                  style={{ flex: 1 }}
                  placeholder="Tier name"
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) => updateTier(idx, 'price', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Interval</label>
                  <select value={tier.interval} onChange={(e) => updateTier(idx, 'interval', e.target.value)}>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Features (one per line)</label>
                <textarea
                  rows={4}
                  value={tier.features.join('\n')}
                  onChange={(e) => updateTierFeatures(idx, e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Configuration */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>AI Configuration (Anthropic)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Anthropic API Key</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.ai.apiKey || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, ai: { ...prev.ai, apiKey: e.target.value } }))}
                placeholder="sk-ant-..."
                style={{ flex: 1 }}
              />
              <button
                className="btn-ghost"
                onClick={() => setShowApiKey((v) => !v)}
                style={{ fontSize: 12, whiteSpace: 'nowrap' }}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              Used for AI blog generation and support. Stored securely in Firestore. Overrides the .env.local value if set.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Claude Model</label>
              <select
                value={settings.ai.model}
                onChange={(e) => setSettings((prev) => ({ ...prev, ai: { ...prev.ai, model: e.target.value } }))}
              >
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                <option value="claude-opus-4-20250514">Claude Opus 4</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Max Tokens</label>
              <input
                type="number"
                value={settings.ai.maxTokens}
                onChange={(e) => setSettings((prev) => ({ ...prev, ai: { ...prev.ai, maxTokens: parseInt(e.target.value) || 1024 } }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* App Configuration */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>App Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Minimum App Version</label>
            <input
              value={settings.app.minVersion}
              onChange={(e) => setSettings((prev) => ({ ...prev, app: { ...prev.app, minVersion: e.target.value } }))}
              placeholder="1.0.0"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>Maintenance Mode</label>
            <button
              className={settings.app.maintenanceMode ? 'btn-danger' : 'btn-ghost'}
              onClick={() => setSettings((prev) => ({ ...prev, app: { ...prev.app, maintenanceMode: !prev.app.maintenanceMode } }))}
              style={{ fontSize: 13 }}
            >
              {settings.app.maintenanceMode ? 'ON — App Disabled' : 'OFF — App Active'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
