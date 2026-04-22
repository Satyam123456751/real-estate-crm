import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>🏠 RealEstate CRM</div>
        <h1 style={styles.hero}>Manage your<br /><span style={styles.accent}>real estate</span><br />empire.</h1>
        <p style={styles.sub}>Leads, deals, properties & clients — all in one place.</p>
        <div style={styles.stats}>
          {[['500+', 'Properties'], ['1.2K', 'Clients'], ['₹2Cr+', 'Revenue']].map(([v, l]) => (
            <div key={l} style={styles.stat}>
              <div style={styles.statVal}>{v}</div>
              <div style={styles.statLab}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="admin@crm.com" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.hint}>
            <span style={{ color: '#64748b', fontSize: 12 }}>Default: </span>
            <span style={{ color: '#6366f1', fontSize: 12 }}>admin@crm.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f172a' },
  left: { flex: 1, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
  brand: { fontSize: 18, fontWeight: 800, color: '#6366f1', marginBottom: 48 },
  hero: { fontSize: 52, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1px' },
  accent: { color: '#6366f1' },
  sub: { fontSize: 16, color: '#64748b', marginBottom: 48, maxWidth: 320 },
  stats: { display: 'flex', gap: 32 },
  stat: { display: 'flex', flexDirection: 'column' },
  statVal: { fontSize: 28, fontWeight: 800, color: '#f1f5f9' },
  statLab: { fontSize: 13, color: '#64748b', marginTop: 2 },
  right: { width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#0f172a', borderLeft: '1px solid #1e293b' },
  card: { width: '100%' },
  title: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 32 },
  errorBox: { background: '#450a0a', border: '1px solid #ef444444', color: '#fca5a5', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '14px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  hint: { textAlign: 'center', marginTop: 24, padding: '12px', background: '#1e293b', borderRadius: 10 },
};