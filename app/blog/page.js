'use client';
import { useState, useEffect } from 'react';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, object = editor
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const newPost = () => {
    setEditing({ title: '', content: '', category: 'general', published: false });
  };

  const savePost = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await fetch('/api/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        if (res.ok) {
          const data = await res.json();
          setEditing((prev) => ({ ...prev, id: data.id }));
        }
      }
      await loadPosts();
    } catch {
      // silent
    }
    setSaving(false);
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await fetch('/api/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch {
      // silent
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, task: 'blog' }),
      });
      if (res.ok) {
        const data = await res.json();
        setEditing((prev) => ({ ...prev, content: data.response }));
      }
    } catch {
      // silent
    }
    setAiLoading(false);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-dim)', padding: 40 }}>Loading blog posts...</div>;
  }

  // Editor view
  if (editing) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button className="btn-ghost" onClick={() => setEditing(null)} style={{ fontSize: 13 }}>
            ← Back to Posts
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-ghost"
              onClick={() => setEditing((prev) => ({ ...prev, published: !prev.published }))}
              style={{ fontSize: 13 }}
            >
              {editing.published ? 'Unpublish' : 'Publish'}
            </button>
            <button className="btn-primary" onClick={savePost} disabled={saving} style={{ fontSize: 13 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <input
            value={editing.title}
            onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Post title"
            style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <select
              value={editing.category}
              onChange={(e) => setEditing((prev) => ({ ...prev, category: e.target.value }))}
              style={{ width: 'auto' }}
            >
              <option value="general">General</option>
              <option value="glucose">Glucose</option>
              <option value="fasting">Fasting</option>
              <option value="nutrition">Nutrition</option>
              <option value="exercise">Exercise</option>
              <option value="tips">Tips</option>
            </select>
            <span className={editing.published ? 'badge badge-green' : 'badge badge-red'}>
              {editing.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <textarea
            value={editing.content}
            onChange={(e) => setEditing((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Write your blog post content here..."
            rows={16}
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {/* AI Writer */}
        <div className="card" style={{ background: 'var(--purple-dim)', borderColor: 'var(--purple)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--purple)', marginBottom: 8 }}>AI Content Writer</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Write a 500-word article about intermittent fasting for beginners"
              style={{ flex: 1 }}
            />
            <button className="btn-purple" onClick={generateWithAI} disabled={aiLoading} style={{ whiteSpace: 'nowrap' }}>
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
            Powered by Claude AI. Generated content will replace the current post body.
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Blog</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{posts.length} posts</p>
        </div>
        <button className="btn-primary" onClick={newPost}>New Post</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td style={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => setEditing(post)}>
                  {post.title || 'Untitled'}
                </td>
                <td style={{ color: 'var(--text-dim)' }}>{post.category}</td>
                <td>
                  <span className={post.published ? 'badge badge-green' : 'badge badge-red'}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setEditing(post)}>
                      Edit
                    </button>
                    <button className="btn-danger" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => deletePost(post.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 32 }}>No blog posts yet. Create your first one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
