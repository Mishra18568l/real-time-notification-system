import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
function normalize(item) { return { ...item, id: String(item.id ?? item.eventId ?? crypto.randomUUID()) }; }
export function useNotifications(token, onUnauthorized) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [lastIncoming, setLastIncoming] = useState(null);
  const socketRef = useRef(null);
  const retryRef = useRef(null);
  const mountedRef = useRef(false);
  const refresh = useCallback(async () => {
    try {
      const data = await api('/me/notifications', { token });
      if (!Array.isArray(data)) throw new Error('Unexpected notification response.');
      setNotifications(prev => {
        const map = new Map();
        [...data.map(normalize), ...prev].forEach(n => map.set(n.id, n));
        return [...map.values()].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      });
      setError('');
    } catch (err) {
      if (err.status === 401) onUnauthorized();
      else setError(err.message);
    } finally { setLoading(false); }
  }, [token, onUnauthorized]);
  useEffect(() => { setNotifications([]); setLoading(true); refresh(); }, [refresh]);
  useEffect(() => {
    if (!token) return;
    mountedRef.current = true;
    let attempt = 0;
    let ws;
    const connect = async () => {
      if (!mountedRef.current) return;
      setConnection('connecting');
      try {
        const { ticket } = await api('/ws-ticket', { method: 'POST', token });
        if (!ticket) throw new Error('No WebSocket ticket returned.');
        if (!mountedRef.current) return;
        ws = new WebSocket(`${WS_URL}?ticket=${encodeURIComponent(ticket)}`);
        socketRef.current = ws;
        ws.onopen = () => { attempt = 0; setConnection('connected'); refresh(); };
        ws.onmessage = event => {
          try {
            const data = normalize(JSON.parse(event.data));
            setNotifications(prev => [data, ...prev.filter(n => n.id !== data.id)]);
            setLastIncoming(data);
          } catch { console.warn('Ignored malformed WebSocket message'); }
        };
        ws.onclose = () => scheduleRetry();
        ws.onerror = () => ws.close();
      } catch (err) {
        if (err.status === 401) { setConnection('unauthorized'); onUnauthorized(); return; }
        scheduleRetry();
      }
    };
    const scheduleRetry = () => {
      if (!mountedRef.current) return;
      setConnection('reconnecting');
      const delay = Math.min(1000 * (2 ** Math.min(attempt++, 5)), 30000);
      retryRef.current = setTimeout(connect, delay);
    };
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(retryRef.current);
      if (ws) { ws.onclose = null; ws.close(); }
      socketRef.current = null;
    };
  }, [token, refresh, onUnauthorized]);
  return { notifications, loading, error, connection, lastIncoming, refresh };
}