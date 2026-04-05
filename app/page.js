'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    fetch('/api/blog/public').then((r) => r.ok ? r.json() : { posts: [] }).then((d) => setBlogPosts((d.posts || []).slice(0, 3))).catch(() => {});
  }, []);

  const handleContact = async (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactForm),
        });
      } catch {
        // still show success
      }
      setContactSent(true);
      setContactForm({ name: '', email: '', message: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        :root {
          --bg: #0C0F0E;
          --surface: #141918;
          --surface-hover: #1A2120;
          --accent: #3DFBB0;
          --accent-dim: rgba(61,251,176,0.12);
          --accent-glow: rgba(61,251,176,0.25);
          --text: #E8EFEC;
          --text-dim: #7B8F88;
          --warm: #F5C96A;
          --danger: #FF6B6B;
          --purple: #B07AFF;
          --purple-dim: rgba(176,122,255,0.12);
          --radius: 16px;
        }

        body { font-family:'Plus Jakarta Sans',sans-serif; background:var(--bg); color:var(--text); overflow-x:hidden; -webkit-font-smoothing:antialiased; }

        .ambient { position:fixed; top:-30%; left:-10%; width:600px; height:600px; background:radial-gradient(circle,var(--accent-glow) 0%,transparent 70%); filter:blur(120px); opacity:0.3; pointer-events:none; z-index:0; animation:drift 20s ease-in-out infinite alternate; }
        .ambient.two { top:auto; bottom:-20%; left:auto; right:-10%; background:radial-gradient(circle,rgba(245,201,106,0.15) 0%,transparent 70%); animation-delay:-10s; }
        .ambient.three { top:40%; left:50%; width:400px; height:400px; background:radial-gradient(circle,var(--purple-dim) 0%,transparent 70%); animation-delay:-5s; }
        @keyframes drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(60px,40px) scale(1.1)} }

        .lp { max-width:1080px; margin:0 auto; padding:0 24px; position:relative; z-index:1; }

        /* Nav */
        .lp-nav { padding:20px 0; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.04); }
        .lp-logo { font-family:'DM Serif Display',serif; font-size:1.5rem; color:var(--accent); letter-spacing:-0.5px; }
        .lp-logo span { color:var(--text); }
        .lp-nav-links { display:flex; gap:24px; align-items:center; }
        .lp-nav-links a { color:var(--text-dim); font-size:0.85rem; text-decoration:none; font-weight:500; transition:color 0.2s; }
        .lp-nav-links a:hover { color:var(--text); }
        .lp-nav-btns { display:flex; gap:10px; align-items:center; }
        .lp-login-link { background:transparent; border:1px solid rgba(255,255,255,0.1); color:var(--text-dim); font-weight:500; font-size:0.82rem; padding:9px 18px; border-radius:100px; cursor:pointer; transition:border-color 0.3s,color 0.3s; font-family:inherit; }
        .lp-login-link:hover { border-color:var(--accent); color:var(--accent); }
        .lp-nav-cta { background:var(--accent); color:var(--bg); font-weight:600; font-size:0.85rem; padding:10px 22px; border-radius:100px; border:none; cursor:pointer; transition:transform 0.2s,box-shadow 0.2s; font-family:inherit; text-decoration:none; display:inline-block; }
        .lp-nav-cta:hover { transform:translateY(-1px); box-shadow:0 4px 24px var(--accent-glow); }

        /* Hero */
        .lp-hero { padding:100px 0 80px; text-align:center; }
        .lp-hero-trust { display:inline-flex; align-items:center; gap:8px; background:var(--surface); border:1px solid rgba(255,255,255,0.06); padding:6px 16px 6px 8px; border-radius:100px; margin-bottom:28px; animation:fadeUp 0.6s ease both; }
        .lp-hero-trust .dots { display:flex; gap:-4px; }
        .lp-hero-trust .dot { width:24px; height:24px; border-radius:50%; border:2px solid var(--bg); margin-left:-6px; font-size:10px; display:flex; align-items:center; justify-content:center; }
        .lp-hero-trust span { font-size:0.78rem; color:var(--text-dim); font-weight:500; }
        .lp-hero-trust strong { color:var(--accent); }
        .lp-hero h1 { font-family:'DM Serif Display',serif; font-size:clamp(2.6rem,6.5vw,4.2rem); line-height:1.08; margin-bottom:24px; animation:fadeUp 0.7s 0.1s ease both; letter-spacing:-0.5px; }
        .lp-hero h1 .hl { color:var(--accent); position:relative; }
        .lp-hero h1 .hl::after { content:''; position:absolute; bottom:2px; left:0; right:0; height:3px; background:var(--accent); opacity:0.3; border-radius:2px; }
        .lp-hero .lp-sub { font-size:1.15rem; color:var(--text-dim); max-width:560px; margin:0 auto 40px; line-height:1.7; animation:fadeUp 0.7s 0.2s ease both; }
        .lp-hero-ctas { display:flex; gap:12px; justify-content:center; animation:fadeUp 0.7s 0.3s ease both; flex-wrap:wrap; }
        .lp-btn-big { padding:16px 36px; background:var(--accent); color:var(--bg); font-weight:700; font-size:0.95rem; border:none; border-radius:100px; cursor:pointer; font-family:inherit; transition:transform 0.2s,box-shadow 0.2s; }
        .lp-btn-big:hover { transform:translateY(-2px); box-shadow:0 8px 40px var(--accent-glow); }
        .lp-btn-outline { padding:16px 36px; background:transparent; color:var(--text); font-weight:600; font-size:0.95rem; border:1px solid rgba(255,255,255,0.12); border-radius:100px; cursor:pointer; font-family:inherit; transition:border-color 0.3s; }
        .lp-btn-outline:hover { border-color:var(--accent); }
        .lp-hero-note { font-size:0.78rem; color:var(--text-dim); margin-top:16px; animation:fadeUp 0.7s 0.4s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* Phone mockup */
        .lp-hero-visual { margin-top:64px; display:flex; justify-content:center; animation:fadeUp 1s 0.5s ease both; }
        .lp-phone { width:280px; background:var(--surface); border-radius:32px; border:1px solid rgba(255,255,255,0.06); padding:20px; box-shadow:0 40px 80px rgba(0,0,0,0.5); }
        .lp-phone-status { display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-dim); margin-bottom:20px; padding:0 4px; }
        .lp-glucose { text-align:center; margin-bottom:20px; }
        .lp-glucose .gl-label { font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
        .lp-glucose .gl-val { font-family:'DM Serif Display',serif; font-size:3.2rem; color:var(--accent); line-height:1; }
        .lp-glucose .gl-unit { font-size:0.8rem; color:var(--text-dim); margin-top:2px; }
        .lp-chart { height:80px; margin:16px 0; overflow:hidden; }
        .lp-chart svg { width:100%; height:100%; }
        .lp-mini-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:16px; }
        .lp-mini-stat { background:rgba(255,255,255,0.03); border-radius:12px; padding:10px 8px; text-align:center; }
        .lp-ms-val { font-weight:700; font-size:0.95rem; }
        .lp-ms-label { font-size:0.6rem; color:var(--text-dim); margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }
        .lp-fasting-pill { display:flex; align-items:center; gap:8px; background:rgba(245,201,106,0.1); border-radius:12px; padding:10px 14px; margin-top:12px; }
        .lp-fb-dot { width:8px; height:8px; background:var(--warm); border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .lp-fb-text { font-size:0.75rem; color:var(--warm); font-weight:600; }
        .lp-fb-time { margin-left:auto; font-size:0.75rem; color:var(--text-dim); }

        /* Social proof strip */
        .lp-proof { display:flex; justify-content:center; gap:40px; padding:40px 0; border-top:1px solid rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.04); flex-wrap:wrap; }
        .lp-proof-item { text-align:center; }
        .lp-proof-num { font-family:'DM Serif Display',serif; font-size:2rem; color:var(--accent); }
        .lp-proof-label { font-size:0.75rem; color:var(--text-dim); margin-top:4px; text-transform:uppercase; letter-spacing:1px; font-weight:600; }

        /* Sections */
        .lp-section { padding:80px 0; }
        .lp-slabel { font-size:0.72rem; text-transform:uppercase; letter-spacing:2px; color:var(--accent); font-weight:600; margin-bottom:16px; }
        .lp-section h2 { font-family:'DM Serif Display',serif; font-size:clamp(1.8rem,4vw,2.6rem); line-height:1.2; margin-bottom:20px; }
        .lp-section p.desc { color:var(--text-dim); font-size:1rem; line-height:1.7; max-width:600px; margin-bottom:40px; }

        /* Pain points */
        .lp-pain-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
        .lp-pain-card { background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:var(--radius); padding:28px 24px; transition:border-color 0.3s,transform 0.2s; }
        .lp-pain-card:hover { border-color:rgba(255,255,255,0.1); transform:translateY(-2px); }
        .lp-pain-card .pc-icon { font-size:1.6rem; margin-bottom:14px; }
        .lp-pain-card h3 { font-size:1rem; font-weight:600; margin-bottom:8px; }
        .lp-pain-card p { font-size:0.85rem; color:var(--text-dim); line-height:1.6; }

        /* How it works */
        .lp-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:24px; counter-reset:step; }
        .lp-step { position:relative; padding:32px 24px; background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:var(--radius); transition:border-color 0.3s,transform 0.2s; }
        .lp-step:hover { border-color:var(--accent); transform:translateY(-3px); }
        .lp-step::before { counter-increment:step; content:counter(step); position:absolute; top:24px; right:24px; font-family:'DM Serif Display',serif; font-size:2.5rem; color:rgba(61,251,176,0.08); line-height:1; }
        .lp-step .step-icon { font-size:1.8rem; margin-bottom:16px; }
        .lp-step h3 { font-size:1rem; font-weight:600; margin-bottom:8px; }
        .lp-step p { font-size:0.85rem; color:var(--text-dim); line-height:1.6; }

        /* Value props */
        .lp-value-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .lp-value-card { background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:var(--radius); padding:32px 28px; transition:border-color 0.3s,transform 0.2s; }
        .lp-value-card:hover { border-color:var(--accent); transform:translateY(-3px); }
        .lp-value-card .vc-icon { font-size:1.4rem; margin-bottom:14px; }
        .lp-value-card h3 { font-size:1.05rem; font-weight:600; margin-bottom:8px; }
        .lp-value-card p { font-size:0.88rem; color:var(--text-dim); line-height:1.65; }
        .lp-value-card.highlight { border-color:rgba(61,251,176,0.15); background:linear-gradient(135deg,rgba(61,251,176,0.04),var(--surface)); }

        /* Features */
        .lp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; }
        .lp-feature-card { background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:var(--radius); padding:32px 28px; transition:border-color 0.3s,transform 0.2s; }
        .lp-feature-card:hover { border-color:var(--accent); transform:translateY(-3px); }
        .lp-fc-badge { display:inline-block; font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:3px 10px; border-radius:100px; margin-bottom:16px; }
        .lp-fc-badge.free { background:var(--accent-dim); color:var(--accent); }
        .lp-fc-badge.premium { background:rgba(245,201,106,0.12); color:var(--warm); }
        .lp-feature-card h3 { font-size:1.1rem; font-weight:600; margin-bottom:10px; }
        .lp-feature-card p { font-size:0.88rem; color:var(--text-dim); line-height:1.65; }

        /* GI Demo */
        .lp-gi-demo { max-width:480px; margin:0 auto; }
        .lp-gi-search { display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px 20px; margin-bottom:16px; }
        .lp-gi-results { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
        .lp-gi-item { display:flex; justify-content:space-between; align-items:center; background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:14px; padding:16px 20px; transition:border-color 0.3s,transform 0.2s; }
        .lp-gi-item:hover { border-color:rgba(255,255,255,0.1); transform:translateX(4px); }
        .lp-gi-name { font-weight:600; font-size:0.95rem; margin-bottom:3px; }
        .lp-gi-meta { font-size:0.75rem; color:var(--text-dim); }
        .lp-gi-score { text-align:center; min-width:54px; padding:8px 12px; border-radius:10px; }
        .lp-gi-score.high { background:rgba(255,107,107,0.12); }
        .lp-gi-score.med { background:rgba(245,201,106,0.12); }
        .lp-gi-score.low { background:var(--accent-dim); }
        .lp-gi-num { font-weight:700; font-size:1.2rem; line-height:1; }
        .lp-gi-score.high .lp-gi-num { color:var(--danger); }
        .lp-gi-score.med .lp-gi-num { color:var(--warm); }
        .lp-gi-score.low .lp-gi-num { color:var(--accent); }
        .lp-gi-lbl { font-size:0.55rem; font-weight:700; letter-spacing:1px; margin-top:2px; }
        .lp-gi-score.high .lp-gi-lbl { color:var(--danger); }
        .lp-gi-score.med .lp-gi-lbl { color:var(--warm); }
        .lp-gi-score.low .lp-gi-lbl { color:var(--accent); }
        .lp-gi-tip { display:flex; align-items:flex-start; gap:10px; background:var(--accent-dim); border-radius:12px; padding:14px 18px; font-size:0.82rem; color:var(--accent); line-height:1.6; }

        /* Fasting banner */
        .lp-fasting-banner { background:linear-gradient(135deg,rgba(245,201,106,0.08),rgba(61,251,176,0.06)); border:1px solid rgba(245,201,106,0.15); border-radius:var(--radius); padding:48px 40px; display:flex; align-items:center; gap:40px; }
        .lp-fasting-banner .rb-icon { font-size:3.5rem; flex-shrink:0; }
        .lp-fasting-banner h3 { font-family:'DM Serif Display',serif; font-size:1.5rem; margin-bottom:10px; color:var(--warm); }
        .lp-fasting-banner p { font-size:0.92rem; color:var(--text-dim); line-height:1.7; }

        /* Comparison */
        .lp-compare { max-width:700px; margin:0 auto; }
        .lp-compare-row { display:grid; grid-template-columns:1fr auto 1fr; gap:0; align-items:center; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .lp-compare-row.header { border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:16px; margin-bottom:4px; }
        .lp-compare-row .left { font-size:0.88rem; color:var(--text-dim); }
        .lp-compare-row .vs { font-size:0.7rem; color:var(--text-dim); text-align:center; padding:0 16px; font-weight:600; }
        .lp-compare-row .right { font-size:0.88rem; color:var(--accent); font-weight:500; text-align:right; }
        .lp-compare-row.header .left { color:var(--danger); font-weight:600; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; }
        .lp-compare-row.header .right { color:var(--accent); font-weight:600; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; }

        /* Pricing */
        .lp-pricing-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:700px; margin:0 auto; }
        .lp-price-card { background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:var(--radius); padding:36px 28px; text-align:center; transition:transform 0.2s; }
        .lp-price-card:hover { transform:translateY(-3px); }
        .lp-price-card.featured { border-color:var(--accent); box-shadow:0 0 60px var(--accent-dim); }
        .lp-price-card .tier { font-size:0.75rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-dim); font-weight:600; margin-bottom:12px; }
        .lp-price-card .price { font-family:'DM Serif Display',serif; font-size:2.8rem; margin-bottom:4px; }
        .lp-price-card.featured .price { color:var(--accent); }
        .lp-price-card .period { font-size:0.8rem; color:var(--text-dim); margin-bottom:24px; }
        .lp-price-card ul { list-style:none; text-align:left; margin-bottom:28px; }
        .lp-price-card li { font-size:0.85rem; color:var(--text-dim); padding:6px 0 6px 20px; position:relative; }
        .lp-price-card li::before { content:'\\2713'; position:absolute; left:0; color:var(--accent); font-weight:700; }
        .lp-plan-btn { width:100%; padding:12px; border-radius:100px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:var(--text); font-weight:600; font-size:0.85rem; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .lp-price-card.featured .lp-plan-btn { background:var(--accent); color:var(--bg); border-color:var(--accent); }
        .lp-yearly-note { text-align:center; margin-top:16px; font-size:0.85rem; color:var(--text-dim); }
        .lp-yearly-note strong { color:var(--warm); }

        /* Blog */
        .lp-blog-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:20px; }
        .lp-blog-card { background:var(--surface); border:1px solid rgba(255,255,255,0.04); border-radius:var(--radius); padding:28px 24px; transition:border-color 0.3s,transform 0.2s; }
        .lp-blog-card:hover { border-color:var(--accent); transform:translateY(-3px); }
        .lp-blog-cat { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--accent); margin-bottom:10px; }
        .lp-blog-card h3 { font-size:1.05rem; font-weight:600; margin-bottom:8px; line-height:1.4; }
        .lp-blog-card p { font-size:0.85rem; color:var(--text-dim); line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .lp-blog-date { font-size:0.72rem; color:var(--text-dim); margin-top:12px; opacity:0.7; }
        .lp-blog-empty { text-align:center; padding:40px; color:var(--text-dim); font-size:0.95rem; }

        /* Contact */
        .lp-contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; max-width:800px; margin:0 auto; }
        .lp-contact-info { display:flex; flex-direction:column; justify-content:center; gap:24px; }
        .lp-contact-item { display:flex; align-items:flex-start; gap:14px; }
        .lp-contact-icon { font-size:1.4rem; flex-shrink:0; margin-top:2px; }
        .lp-contact-item h4 { font-size:0.9rem; font-weight:600; margin-bottom:4px; }
        .lp-contact-item p { font-size:0.85rem; color:var(--text-dim); line-height:1.5; }
        .lp-contact-form { display:flex; flex-direction:column; gap:12px; }
        .lp-contact-form input, .lp-contact-form textarea { padding:14px 18px; background:var(--surface); border:1px solid rgba(255,255,255,0.06); border-radius:12px; color:var(--text); font-size:0.9rem; font-family:inherit; outline:none; transition:border-color 0.3s; width:100%; }
        .lp-contact-form input:focus, .lp-contact-form textarea:focus { border-color:var(--accent); }
        .lp-contact-form input::placeholder, .lp-contact-form textarea::placeholder { color:var(--text-dim); }
        .lp-contact-form textarea { resize:vertical; min-height:120px; }
        .lp-contact-btn { padding:14px; background:var(--accent); color:var(--bg); font-weight:700; font-size:0.9rem; border:none; border-radius:12px; cursor:pointer; font-family:inherit; transition:transform 0.2s,box-shadow 0.2s; }
        .lp-contact-btn:hover { transform:translateY(-1px); box-shadow:0 6px 30px var(--accent-glow); }
        .lp-contact-success { text-align:center; padding:40px 20px; color:var(--accent); font-size:1rem; font-weight:600; background:var(--accent-dim); border-radius:var(--radius); }

        /* Final CTA */
        .lp-final { text-align:center; padding:100px 0 80px; }
        .lp-final h2 { font-family:'DM Serif Display',serif; font-size:clamp(2rem,5vw,3rem); margin-bottom:16px; }
        .lp-final p { color:var(--text-dim); font-size:1.05rem; margin-bottom:32px; max-width:500px; margin-left:auto; margin-right:auto; line-height:1.7; }

        /* Footer */
        .lp-footer { border-top:1px solid rgba(255,255,255,0.04); padding:32px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
        .lp-footer-left { font-size:0.78rem; color:var(--text-dim); }
        .lp-footer-links { display:flex; gap:20px; }
        .lp-footer-links a { font-size:0.78rem; color:var(--text-dim); text-decoration:none; transition:color 0.2s; }
        .lp-footer-links a:hover { color:var(--accent); }

        /* Login Modal */
        .lp-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); animation:fadeIn 0.2s ease; }
        .lp-modal { background:#141C1A; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:32px; width:380px; max-width:90vw; text-align:center; position:relative; }
        .lp-modal h3 { font-family:'DM Serif Display',serif; font-size:1.4rem; color:var(--accent); margin-bottom:4px; }
        .lp-modal .subtitle { font-size:0.8rem; color:var(--text-dim); margin-bottom:24px; }
        .lp-modal form { display:flex; flex-direction:column; gap:12px; }
        .lp-modal input { padding:12px 16px; background:var(--surface); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:var(--text); font-size:0.9rem; font-family:inherit; outline:none; width:100%; }
        .lp-modal input:focus { border-color:var(--accent); }
        .lp-modal .lp-submit-btn { padding:12px; background:var(--accent); color:var(--bg); font-weight:700; font-size:0.9rem; border:none; border-radius:8px; cursor:pointer; font-family:inherit; }
        .lp-modal .lp-submit-btn:disabled { opacity:0.4; }
        .lp-modal .lp-error { color:var(--danger); font-size:0.78rem; }
        .lp-close { position:absolute; top:16px; right:20px; background:none; border:none; color:var(--text-dim); font-size:1.3rem; cursor:pointer; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        @media (max-width:640px) {
          .lp-hero-ctas { flex-direction:column; align-items:center; }
          .lp-pricing-row { grid-template-columns:1fr; }
          .lp-fasting-banner { flex-direction:column; text-align:center; padding:32px 24px; gap:20px; }
          .lp-phone { width:240px; }
          .lp-contact-grid { grid-template-columns:1fr; }
          .lp-value-grid { grid-template-columns:1fr; }
          .lp-compare-row { font-size:0.8rem; }
          .lp-nav-links { display:none; }
          .lp-footer { flex-direction:column; text-align:center; }
        }
      `}</style>

      <div className="ambient"></div>
      <div className="ambient two"></div>
      <div className="ambient three"></div>

      <div className="lp">

        {/* ─── Nav ─── */}
        <nav className="lp-nav">
          <div className="lp-logo">Gluco<span>Fast</span></div>
          <div className="lp-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="lp-nav-btns">
            <button className="lp-login-link" onClick={() => setShowLogin(true)}>Log In</button>
            <a href="#pricing" className="lp-nav-cta">Download Free</a>
          </div>
        </nav>

        {/* ─── Hero ─── */}
        <section className="lp-hero">
          <div className="lp-hero-trust">
            <div className="dots">
              <div className="dot" style={{background:'#3DFBB0'}}>&#x2713;</div>
              <div className="dot" style={{background:'#F5C96A'}}>&#x2713;</div>
              <div className="dot" style={{background:'#B07AFF'}}>&#x2713;</div>
            </div>
            <span>Trusted by <strong>health-conscious</strong> people across the Middle East</span>
          </div>

          <h1>Stop guessing your glucose.<br/>Start <span className="hl">understanding</span> it.</h1>
          <p className="lp-sub">GlucoFast turns your simple glucometer readings into powerful insights — personalized alerts, fasting optimization, and food scoring. No CGM required. No $150/month subscription.</p>

          <div className="lp-hero-ctas">
            <button className="lp-btn-big" onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Get Started Free</button>
            <button className="lp-btn-outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}>See How It Works</button>
          </div>
          <p className="lp-hero-note">Free plan forever. No credit card. Available on Android &amp; iOS.</p>

          <div className="lp-hero-visual">
            <div className="lp-phone">
              <div className="lp-phone-status"><span>9:41 AM</span><span>Fasting</span></div>
              <div className="lp-glucose">
                <div className="gl-label">Current Glucose</div>
                <div className="gl-val">94</div>
                <div className="gl-unit">mg/dL — In Range</div>
              </div>
              <div className="lp-chart">
                <svg viewBox="0 0 240 80" fill="none">
                  <defs><linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3DFBB0" stopOpacity="0.3"/><stop offset="100%" stopColor="#3DFBB0" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 60 Q30 50, 50 55 T100 40 T150 45 T200 30 T240 35" stroke="#3DFBB0" strokeWidth="2" fill="none"/>
                  <path d="M0 60 Q30 50, 50 55 T100 40 T150 45 T200 30 T240 35 L240 80 L0 80 Z" fill="url(#glow)"/>
                  <line x1="0" y1="25" x2="240" y2="25" stroke="rgba(255,107,107,0.15)" strokeDasharray="4 4"/>
                </svg>
              </div>
              <div className="lp-mini-stats">
                <div className="lp-mini-stat"><div className="lp-ms-val">88</div><div className="lp-ms-label">Fasting</div></div>
                <div className="lp-mini-stat"><div className="lp-ms-val">112</div><div className="lp-ms-label">Post-meal</div></div>
                <div className="lp-mini-stat"><div className="lp-ms-val">5.4%</div><div className="lp-ms-label">Est. A1c</div></div>
              </div>
              <div className="lp-fasting-pill">
                <div className="lp-fb-dot"></div>
                <span className="lp-fb-text">Suhoor Fast</span>
                <span className="lp-fb-time">14h 22m</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Social Proof Strip ─── */}
        <div className="lp-proof">
          <div className="lp-proof-item"><div className="lp-proof-num">240+</div><div className="lp-proof-label">Foods in GI Database</div></div>
          <div className="lp-proof-item"><div className="lp-proof-num">5</div><div className="lp-proof-label">Fasting Protocols</div></div>
          <div className="lp-proof-item"><div className="lp-proof-num">30s</div><div className="lp-proof-label">To Log a Reading</div></div>
          <div className="lp-proof-item"><div className="lp-proof-num">$0</div><div className="lp-proof-label">To Get Started</div></div>
        </div>

        {/* ─── The Problem ─── */}
        <section className="lp-section">
          <div className="lp-slabel">The Problem</div>
          <h2>You&apos;re tracking glucose.<br/>But are you <em>learning</em> from it?</h2>
          <p className="desc">Millions check their blood sugar daily. Most log numbers in a notebook or a basic app — with zero insight into what those numbers actually mean for their health.</p>
          <div className="lp-pain-grid">
            {[
              { icon: '\uD83D\uDCB8', title: 'CGMs are overkill & overpriced', desc: 'Continuous monitors cost $150-299/month. You don\'t need a $3,000/year sensor — you need smarter software.' },
              { icon: '\uD83E\uDDE0', title: 'Numbers without context are noise', desc: '94 mg/dL before lunch. 142 after rice. Is that good? Bad? Normal for you? Without patterns, you\'re flying blind.' },
              { icon: '\uD83C\uDF19', title: 'Fasting tracking is an afterthought', desc: 'Whether it\'s Ramadan, intermittent fasting, or 16:8 — no glucose app understands how fasting changes your numbers.' },
              { icon: '\u26A0\uFE0F', title: 'Waiting for your doctor is too late', desc: 'By the time your A1c is flagged, the damage is years in the making. Prevention needs daily awareness — not annual checkups.' },
            ].map((c) => (
              <div key={c.title} className="lp-pain-card">
                <div className="pc-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Value Proposition ─── */}
        <section className="lp-section">
          <div className="lp-slabel">Why GlucoFast</div>
          <h2>The glucose intelligence<br/>your glucometer is missing.</h2>
          <p className="desc">GlucoFast doesn&apos;t replace your meter — it makes it 10x more useful. Log once, understand everything.</p>
          <div className="lp-value-grid">
            {[
              { icon: '\u26A1', title: 'Instant Smart Insights', desc: 'Every reading is analyzed against your history. Get alerts for trends, spikes, and patterns — before they become problems.', hl: true },
              { icon: '\uD83C\uDF7D\uFE0F', title: 'Know What Spikes You', desc: 'Our GI database scores 240+ foods. See exactly which meals cause your glucose to spike — and which ones keep you stable.' },
              { icon: '\uD83C\uDF19', title: 'Fasting-Aware Intelligence', desc: 'Built for Ramadan, IF, and any fasting protocol. Track windows, optimize Suhoor meals, compare fasting vs. fed glucose.' },
              { icon: '\uD83D\uDCC8', title: 'Doctor-Ready Reports', desc: 'Export 30-day reports with estimated A1c, time in range, variability scores, and trend analysis your physician can act on.' },
            ].map((v) => (
              <div key={v.title} className={`lp-value-card ${v.hl ? 'highlight' : ''}`}>
                <div className="vc-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-slabel">How It Works</div>
          <h2>Three steps. Zero complexity.</h2>
          <p className="desc">No wearable needed. No complicated setup. Just your phone and any glucometer.</p>
          <div className="lp-steps">
            {[
              { icon: '\uD83E\uDE78', title: 'Check your glucose', desc: 'Use any glucometer you already have — finger prick, at home, at the pharmacy. Takes 10 seconds.' },
              { icon: '\uD83D\uDCF1', title: 'Log it in GlucoFast', desc: 'Open the app, enter the number, tag your meal. Done in 3 taps. We auto-detect fasting state and time of day.' },
              { icon: '\uD83D\uDCA1', title: 'Get personalized insights', desc: 'See trends, get alerts when patterns shift, learn which foods spike you, and track your progress over time.' },
            ].map((s) => (
              <div key={s.title} className="lp-step">
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CGM vs GlucoFast ─── */}
        <section className="lp-section">
          <div className="lp-slabel">The Comparison</div>
          <h2>80% of CGM insights.<br/>At 5% of the cost.</h2>
          <p className="desc">Here&apos;s what you get with GlucoFast Premium vs. a typical CGM subscription.</p>
          <div className="lp-compare">
            <div className="lp-compare-row header">
              <div className="left">CGM Subscriptions</div>
              <div className="vs">VS</div>
              <div className="right">GlucoFast</div>
            </div>
            {[
              ['$150-299/month','vs','$6.99/month or free'],
              ['Requires wearing a sensor','vs','Works with any glucometer'],
              ['Overwhelming raw data','vs','Clear, actionable insights'],
              ['No fasting optimization','vs','Built-in Ramadan & IF support'],
              ['Generic food logging','vs','240+ foods with GI scoring'],
              ['No meal-to-glucose correlation','vs','Smart food rankings from your data'],
            ].map((row,i) => (
              <div key={i} className="lp-compare-row">
                <div className="left">{row[0]}</div>
                <div className="vs">{row[1]}</div>
                <div className="right">{row[2]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="lp-section" id="features">
          <div className="lp-slabel">Features</div>
          <h2>Everything you need.<br/>Nothing you don&apos;t.</h2>
          <p className="desc">A powerful free tier — and a premium upgrade for those who want the full picture.</p>
          <div className="lp-features-grid">
            {[
              { badge:'free', title:'Quick Glucose Logging', desc:'Log a reading in 3 taps. Auto-tags meal timing, fasting state, and time of day.' },
              { badge:'free', title:'Trend Dashboard', desc:'See your fasting averages, post-meal patterns, and weekly glucose at a glance.' },
              { badge:'free', title:'GI Food Database', desc:'Search 240+ foods by glycemic index. Includes Middle Eastern staples like Kabsa, Mandi, and Jareesh.' },
              { badge:'free', title:'Fasting Timer', desc:'Track any fasting protocol — 16:8, 18:6, Ramadan, or custom windows.' },
              { badge:'premium', title:'Smart Insights & Alerts', desc:'AI-powered pattern detection. Get notified when your trends shift before your next lab.' },
              { badge:'premium', title:'Bedtime Protocol', desc:'Pair bedtime readings with morning fasting glucose to optimize overnight stability.' },
              { badge:'premium', title:'Food Rankings', desc:'See which meals cause your biggest spikes — ranked from your own glucose data.' },
              { badge:'premium', title:'PDF & CSV Reports', desc:'Export 30-day reports with estimated A1c, time in range, and variability for your doctor.' },
            ].map((f) => (
              <div key={f.title} className="lp-feature-card">
                <span className={`lp-fc-badge ${f.badge}`}>{f.badge}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── GI Demo ─── */}
        <section className="lp-section">
          <div className="lp-slabel">Glycemic Index Database</div>
          <h2>Check before you eat.<br/>Know what spikes you.</h2>
          <p className="desc">Search any food instantly. See its GI score, glycemic load, and a healthier swap suggestion.</p>
          <div className="lp-gi-demo">
            <div className="lp-gi-search"><span style={{fontSize:'1.1rem'}}>&#x1F50D;</span><span style={{color:'var(--text-dim)',fontSize:'0.9rem'}}>Search &quot;white rice&quot; or &quot;banana&quot;...</span></div>
            <div className="lp-gi-results">
              {[
                { name:'White Rice (boiled)', meta:'Serving: 150g \u00B7 GL: 29', gi:73, level:'high', label:'HIGH' },
                { name:'Basmati Rice', meta:'Serving: 150g \u00B7 GL: 22', gi:58, level:'med', label:'MED' },
                { name:'Brown Rice', meta:'Serving: 150g \u00B7 GL: 18', gi:50, level:'low', label:'LOW' },
              ].map((f) => (
                <div key={f.name} className="lp-gi-item">
                  <div><div className="lp-gi-name">{f.name}</div><div className="lp-gi-meta">{f.meta}</div></div>
                  <div className={`lp-gi-score ${f.level}`}><div className="lp-gi-num">{f.gi}</div><div className="lp-gi-lbl">{f.label}</div></div>
                </div>
              ))}
            </div>
            <div className="lp-gi-tip"><span style={{flexShrink:0,fontSize:'1rem',marginTop:1}}>&#x1F4A1;</span><span>Swap white rice for basmati to reduce your glucose spike by ~20%. Add fat or vinegar to lower it further.</span></div>
          </div>
        </section>

        {/* ─── Fasting ─── */}
        <section className="lp-section">
          <div className="lp-fasting-banner">
            <div className="rb-icon">&#x1F319;</div>
            <div>
              <h3>Built for Fasting — Any Kind</h3>
              <p>Ramadan, intermittent fasting, OMAD, or faith-based fasting — GlucoFast tracks your windows, compares fasting vs. fed glucose, and recommends Suhoor meals that keep your blood sugar stable until Maghrib. The only glucose app that truly understands fasting.</p>
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="lp-section" id="pricing" style={{textAlign:'center'}}>
          <div className="lp-slabel">Pricing</div>
          <h2>Start free. Upgrade when<br/>you see the difference.</h2>
          <p className="desc" style={{margin:'0 auto 40px'}}>No hardware required. No hidden fees. Cancel anytime.</p>
          <div className="lp-pricing-row">
            <div className="lp-price-card">
              <div className="tier">Free</div>
              <div className="price">$0</div>
              <div className="period">forever</div>
              <ul>
                <li>Unlimited glucose logging</li>
                <li>GI food database (240+ foods)</li>
                <li>Basic trend charts</li>
                <li>Fasting timer</li>
                <li>7-day history</li>
                <li>3 custom reminders</li>
              </ul>
              <button className="lp-plan-btn">Download Free</button>
            </div>
            <div className="lp-price-card featured">
              <div className="tier">Premium</div>
              <div className="price">$6.99</div>
              <div className="period">per month</div>
              <ul>
                <li>Everything in Free</li>
                <li>Smart insights & alerts</li>
                <li>Bedtime protocol</li>
                <li>Food rankings & scoring</li>
                <li>Unlimited history</li>
                <li>Unlimited reminders</li>
                <li>Doctor-ready PDF reports</li>
              </ul>
              <button className="lp-plan-btn">Start Free Trial</button>
            </div>
          </div>
          <p className="lp-yearly-note">Or save 40% with the yearly plan — <strong>$49.99/year</strong></p>
        </section>

        {/* ─── Blog ─── */}
        <section className="lp-section" id="blog">
          <div className="lp-slabel">Blog</div>
          <h2>Health tips &amp; insights</h2>
          <p className="desc">Expert articles on glucose management, fasting, nutrition, and living well.</p>
          {blogPosts.length > 0 ? (
            <div className="lp-blog-grid">
              {blogPosts.map((post) => (
                <div key={post.id} className="lp-blog-card">
                  <div className="lp-blog-cat">{post.category || 'general'}</div>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <div className="lp-blog-date">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lp-blog-empty">New articles coming soon. Check back for tips on glucose management, fasting, and nutrition.</div>
          )}
        </section>

        {/* ─── Contact ─── */}
        <section className="lp-section" id="contact">
          <div className="lp-slabel">Contact Us</div>
          <h2>Questions? Feedback?<br/>We&apos;d love to hear from you.</h2>
          <p className="desc" style={{marginBottom:40}}>Whether you&apos;re a user, a healthcare professional, or interested in partnering — reach out.</p>
          <div className="lp-contact-grid">
            <div className="lp-contact-info">
              <div className="lp-contact-item">
                <div className="lp-contact-icon">&#x2709;</div>
                <div><h4>Email</h4><p>support@glucofast.app</p></div>
              </div>
              <div className="lp-contact-item">
                <div className="lp-contact-icon">&#x1F4AC;</div>
                <div><h4>Response Time</h4><p>We typically respond within 24 hours</p></div>
              </div>
              <div className="lp-contact-item">
                <div className="lp-contact-icon">&#x1F30D;</div>
                <div><h4>Based In</h4><p>Middle East &amp; serving globally</p></div>
              </div>
              <div className="lp-contact-item">
                <div className="lp-contact-icon">&#x1F3E5;</div>
                <div><h4>For Healthcare Providers</h4><p>Interested in recommending GlucoFast to patients? Let&apos;s talk.</p></div>
              </div>
            </div>
            <div>
              {contactSent ? (
                <div className="lp-contact-success">Thank you! We&apos;ll get back to you within 24 hours.</div>
              ) : (
                <form className="lp-contact-form" onSubmit={handleContact}>
                  <input placeholder="Your name" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required />
                  <input type="email" placeholder="Your email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required />
                  <textarea placeholder="How can we help?" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} required />
                  <button type="submit" className="lp-contact-btn">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="lp-final">
          <h2>Your glucose tells a story.<br/>Start reading it today.</h2>
          <p>Join thousands of health-conscious people using GlucoFast to understand their glucose, optimize their fasting, and take control of their metabolic health.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="lp-btn-big" onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Get Started Free</button>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="lp-footer">
          <div className="lp-footer-left">&copy; 2026 GlucoFast. All rights reserved.</div>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>
        </footer>
      </div>

      {/* ─── Login Modal ─── */}
      {showLogin && (
        <div className="lp-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div className="lp-modal">
            <button className="lp-close" onClick={() => setShowLogin(false)}>&times;</button>
            <h3>GlucoFast</h3>
            <div className="subtitle">Sign in to your account</div>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error && <div className="lp-error">{error}</div>}
              <button type="submit" className="lp-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
