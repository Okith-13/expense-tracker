import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = mode === 'login'
      ? login(form.email, form.password)
      : signup(form.name, form.email, form.password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">flo</span>
          <p className="auth-tagline">Money, tracked beautifully.</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature"><span>📊</span><span>Visual dashboards</span></div>
          <div className="auth-feature"><span>🗂️</span><span>Smart categories</span></div>
          <div className="auth-feature"><span>📅</span><span>Monthly summaries</span></div>
          <div className="auth-feature"><span>🔒</span><span>Private & secure</span></div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-sub">{mode === 'login' ? 'Sign in to your workspace' : 'Start tracking in seconds'}</p>

          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && (
              <div className="field">
                <label>Full name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Jane Smith" required />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required minLength={6} />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <span>New here? <button onClick={() => { setMode('signup'); setError(''); }}>Create account</button></span>
            ) : (
              <span>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></span>
            )}
          </div>

          <div className="auth-demo">
            <p>Try the demo account:</p>
            <code>demo@flo.app / demo123</code>
            <button className="demo-btn" onClick={() => { setForm({ name: '', email: 'demo@flo.app', password: 'demo123' }); }}>
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
