import { Bell, CheckCircle2, Info, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
const styles = {
  SUCCESS: { icon: CheckCircle2, color: 'emerald' },
  WELCOME: { icon: ShieldCheck, color: 'violet' },
  ERROR: { icon: AlertTriangle, color: 'rose' },
  WARNING: { icon: AlertTriangle, color: 'amber' },
  INFO: { icon: Info, color: 'blue' }
};
const colorClasses = {
  emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  violet: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
  rose: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  blue: 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
};
export default function NotificationCard({ notification, isRead, onRead }) {
  const type = String(notification.type || 'INFO').toUpperCase();
  const style = styles[type] || { icon: Bell, color: 'blue' };
  const Icon = style.icon;
  const date = notification.createdAt ? new Date(notification.createdAt) : null;
  const when = date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Just now';
  return <article className={`notification-card ${isRead ? 'opacity-70' : ''}`}>
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${colorClasses[style.color]}`}><Icon size={21}/></div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-100">{type.charAt(0) + type.slice(1).toLowerCase()} notification</h3>{!isRead && <span className="h-2 w-2 rounded-full bg-violet-400" aria-label="Unread"/>}</div>
      <p className="mt-1 break-words text-sm leading-6 text-slate-300">{notification.message || 'No message provided'}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Clock size={13}/>{when}</span><span className="rounded-md bg-white/5 px-2 py-0.5">{type}</span></div>
    </div>
    {!isRead && <button onClick={() => onRead(notification.id)} className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-violet-500/50 hover:text-white">Mark read</button>}
  </article>;
}