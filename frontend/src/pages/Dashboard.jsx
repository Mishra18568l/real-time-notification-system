import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BellRing, CheckCheck, CircleHelp, Inbox, LogOut, Menu, Radio, RefreshCw, Search, ShieldCheck, Wifi, WifiOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCard from '../components/NotificationCard';
const readKey = username => `pulse_read_${username}`;
export default function Dashboard() {
  const { token, username, logout } = useAuth();
  const { notifications, loading, error, connection, lastIncoming, refresh } = useNotifications(token, logout);
  const [readIds, setReadIds] = useState(() => { try { return JSON.parse(localStorage.getItem(readKey(username)) || '[]'); } catch { return []; } });
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => { localStorage.setItem(readKey(username), JSON.stringify(readIds)); }, [readIds, username]);
  useEffect(() => { if (!lastIncoming) return; setToast(lastIncoming); const t = setTimeout(() => setToast(null), 5000); return () => clearTimeout(t); }, [lastIncoming]);
  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const unread = notifications.filter(n => !readSet.has(n.id)).length;
  const visible = notifications.filter(n => {
    if (filter === 'unread' && readSet.has(n.id)) return false;
    if (filter === 'read' && !readSet.has(n.id)) return false;
    const search = `${n.message || ''} ${n.type || ''}`.toLowerCase();
    return search.includes(query.trim().toLowerCase());
  });
  const markRead = id => setReadIds(ids => ids.includes(id) ? ids : [...ids, id]);
  const markAll = () => setReadIds(ids => [...new Set([...ids, ...notifications.map(n => n.id)])]);
  const connected = connection === 'connected';
  return <div className="app-shell">
    {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)}/>}
    <aside className={`sidebar ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center gap-3 px-6 py-8"><div className="brand-mark small"><BellRing size={20}/></div><span className="text-xl font-extrabold tracking-tight">pulse<span className="text-violet-400">.</span></span></div>
      <div className="px-4"><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-600">Workspace</p>
        <button onClick={() => { setFilter('all'); setMenuOpen(false); }} className="nav-item active"><Inbox size={19}/>Notification inbox <span className="ml-auto rounded-md bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">{notifications.length}</span></button>
        <button onClick={() => { setFilter('unread'); setMenuOpen(false); }} className="nav-item"><Bell size={19}/>Unread <span className="ml-auto text-xs text-slate-500">{unread}</span></button>
        <button onClick={() => { setFilter('read'); setMenuOpen(false); }} className="nav-item"><CheckCheck size={19}/>Read</button>
      </div>
      <div className="mt-10 px-7"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-600">System</p><div className="mt-4 flex items-center gap-3 text-sm text-slate-400"><ShieldCheck size={17} className="text-emerald-400"/>JWT protected</div><div className="mt-4 flex items-center gap-3 text-sm text-slate-400"><Radio size={17} className="text-violet-400"/>Live event stream</div></div>
      <div className="mt-auto border-t border-white/10 p-5"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 font-bold text-violet-300">{username.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{username}</p><p className="text-xs text-slate-500">Personal workspace</p></div></div><button onClick={logout} className="nav-item w-full"><LogOut size={18}/>Sign out</button></div>
    </aside>
    <main className="min-w-0 flex-1 lg:ml-[260px]">
      <header className="topbar"><div className="flex items-center gap-3"><button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-300 lg:hidden"><Menu size={21}/></button><span className="text-sm text-slate-400">Workspace <span className="mx-2 text-slate-600">/</span> <span className="font-medium text-white">Notifications</span></span></div><div className={`connection-pill ${connected ? 'online' : ''}`}>{connected ? <Wifi size={15}/> : <WifiOff size={15}/>}<span>{connected ? 'Live connection' : connection === 'reconnecting' ? 'Reconnecting…' : connection === 'unauthorized' ? 'Session expired' : 'Connecting…'}</span></div></header>
      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-9 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><span className="eyebrow"><span className="live-dot"/> YOUR ACTIVITY, IN REAL TIME</span><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Notification center</h1><p className="mt-3 text-sm text-slate-400">Stay on top of every update, as it happens.</p></div><button onClick={refresh} className="secondary-button"><RefreshCw size={16}/> Refresh</button></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-3"><div className="stat-card"><div className="stat-icon violet"><Bell size={20}/></div><p className="mt-5 text-3xl font-bold">{notifications.length}</p><p className="mt-1 text-sm text-slate-400">Total notifications</p></div><div className="stat-card"><div className="stat-icon blue"><Inbox size={20}/></div><p className="mt-5 text-3xl font-bold">{unread}</p><p className="mt-1 text-sm text-slate-400">Unread in this browser</p></div><div className="stat-card"><div className={`stat-icon ${connected ? 'green' : 'blue'}`}><Activity size={20}/></div><p className="mt-5 text-lg font-bold">{connected ? 'Connected' : 'Offline / retrying'}</p><p className="mt-2 text-sm text-slate-400">WebSocket stream</p></div></div>
        <section className="mt-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Your inbox</h2><p className="mt-1 text-sm text-slate-500">Latest 50 notifications from the server, plus live updates</p></div><button disabled={!unread} onClick={markAll} className="secondary-button disabled:opacity-40"><CheckCheck size={16}/> Mark all read</button></div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-xl border border-white/10 bg-white/[.03] p-1">{[['all','All'],['unread','Unread'],['read','Read']].map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-4 py-2 text-sm transition ${filter === value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>)}</div><label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notifications…" aria-label="Search notifications"/></label></div>
          {error && <div role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}
          <div className="mt-5 space-y-3">{loading ? <div className="empty-state">Loading notifications…</div> : visible.length ? visible.map(n => <NotificationCard key={n.id} notification={n} isRead={readSet.has(n.id)} onRead={markRead}/>) : <div className="empty-state"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400"><Bell size={26}/></div><h3 className="font-semibold text-white">Nothing here yet</h3><p className="mt-2 text-sm text-slate-500">{notifications.length ? 'Try changing your filters or search.' : 'Notifications will appear here when events are published for your account.'}</p></div>}</div>
        </section>
        <p className="mt-10 flex items-center gap-2 text-xs text-slate-600"><CircleHelp size={14}/>Read markers are stored in this browser only; the backend does not yet expose a read-status API.</p>
      </div>
    </main>
    {toast && <div role="status" className="toast"><div className="flex items-start gap-3"><div className="stat-icon violet"><BellRing size={19}/></div><div className="min-w-0 flex-1"><p className="font-semibold">New notification</p><p className="mt-1 break-words text-sm text-slate-300">{toast.message}</p></div><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={17}/></button></div></div>}
  </div>;
}