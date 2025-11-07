'use client';
import { useEffect, useState } from 'react';

type Evt = { type?: string; timestamp?: string; payload?: any };

export default function TransactionTimeline({
  transactionId,
  onStatusChange,
}: { transactionId?: string; onStatusChange?: (s:'idle'|'connecting'|'open'|'error') => void }) {

  const [events, setEvents] = useState<Evt[]>([]);
  const [status, setStatus] = useState<'idle'|'connecting'|'open'|'error'>('idle');

  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);

  useEffect(() => {
    if (!transactionId) { setEvents([]); setStatus('idle'); return; }
    setEvents([]); setStatus('connecting');

    const es = new EventSource(`/api/ws?transactionId=${transactionId}`);
    es.onopen = () => setStatus('open');
    es.onerror = () => setStatus('error');
    es.onmessage = (m) => {
      try {
        const e = JSON.parse(m.data);
        if (!e?.type || e.type === 'ping' || e.type === 'connected') return;
        setEvents(prev => [...prev, e]);
      } catch {}
    };
    return () => es.close();
  }, [transactionId]);

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5 shadow-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Timeline de Transacción</h2>
        <p className="text-slate-400 text-sm">Stream en tiempo real</p>
      </div>

      {!transactionId && (
        <div className="text-slate-400 text-sm border border-slate-700 rounded-xl p-6 text-center">
          Aún no hay eventos. Iniciá una transacción para ver el timeline.
        </div>
      )}

      {transactionId && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">ID: <span className="font-mono">{transactionId}</span></div>
          {events.length === 0 && (
            <div className="text-slate-400 text-sm border border-slate-700 rounded-xl p-6 text-center">
              {status === 'connecting' ? 'Conectando…' : 'Esperando eventos…'}
            </div>
          )}
          <ol className="space-y-3">
            {events.map((e, i) => {
              const isGood = e.type === 'Committed' || e.type === 'FundsReserved' || e.type === 'Notified';
              const border = e.type === 'Committed'
                ? 'border-emerald-500/40'
                : e.type === 'Reversed'
                ? 'border-rose-500/40'
                : 'border-slate-700';
              const dot = e.type === 'Committed' ? 'bg-emerald-400' :
                          e.type === 'Reversed' ? 'bg-rose-400' : 'bg-sky-400';

              return (
                <li key={i} className={`rounded-xl border ${border} bg-slate-950/50 p-4 transition hover:bg-slate-900`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                    <div className="font-semibold">{e.type}</div>
                    <div className="ml-auto text-xs text-slate-400">
                      {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}
                    </div>
                  </div>
                  <pre className="mt-2 text-xs text-slate-300/90 overflow-auto">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
