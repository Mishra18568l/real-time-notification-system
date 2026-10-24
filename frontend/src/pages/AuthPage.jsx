import { useState } from 'react';
import { ArrowRight, BellRing, LockKeyhole, Mail, UserRound, Zap, ShieldCheck, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setMode('login'); setNotice('Account created. Sign in to continue.');
      } else await login({ username: form.username, password: form.password });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <main className="auth-shell">
    <section className="auth-brand">
      <div className="brand-mark"><BellRing size={24}/></div>
      <div className="mt-16 max-w-lg"><span className="eyebrow"><span className="live-dot"/> EVENT-DRIVEN NOTIFICATION PLATFORM</span>
        <h1 className="mt-6 text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl">Every signal.<br/><span className="gradient-text">Right on time.</span></h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">A real-time notification experience powered by Spring Boot, RabbitMQ, Redis and secure WebSockets.</p>
      </div>
      <div className="mt-16 grid max-w-lg gap-4 sm:grid-cols-3">
        {[['Lightning fast', Zap], ['Secure by design', ShieldCheck], ['Always connected', Radio]].map(([label, Icon]) => <div key={label} className="feature-chip"><Icon size={19} className="text-violet-400"/><span>{label}</span></div>)}
      </div>
      <p className="mt-auto pt-16 text-xs text-slate-600">PULSE / REAL-TIME SYSTEMS</p>
    </section>
    <section className="auth-form-wrap"><div className="w-full max-w-md">
      <div className="mb-9"><span className="text-xs font-bold uppercase tracking-[.24em] text-violet-400">Welcome to Pulse</span><h2 className="mt-3 text-3xl font-bold tracking-tight">{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2><p className="mt-3 text-sm text-slate-400">{mode === 'login' ? 'Your notification center is waiting.' : 'Start receiving notifications in real time.'}</p></div>
      <div className="mb-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[.03] p-1">{['login','register'].map(tab => <button key={tab} onClick={() => { setMode(tab); setError(''); setNotice(''); }} className={`rounded-lg px-4 py-3 text-sm font-medium transition ${mode === tab ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{tab === 'login' ? 'Sign in' : 'Register'}</button>)}</div>
      <form onSubmit={submit} className="space-y-5">
        <label className="field-label"><span>Username</span><div className="field-wrap"><UserRound size={18}/><input name="username" value={form.username} onChange={change} required autoComplete="username" placeholder="Enter your username"/></div></label>
        {mode === 'register' && <label className="field-label"><span>Email address</span><div className="field-wrap"><Mail size={18}/><input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" placeholder="you@example.com"/></div></label>}
        <label className="field-label"><span>Password</span><div className="field-wrap"><LockKeyhole size={18}/><input name="password" type="password" value={form.password} onChange={change} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Enter your password"/></div></label>
        {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
        <button disabled={busy} className="primary-button w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={18}/></button>
      </form>
      <p className="mt-8 text-center text-xs leading-6 text-slate-500">Protected by JWT authentication and one-time WebSocket tickets.</p>
    </div></section>
  </main>;
}