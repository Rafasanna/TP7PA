'use client';
import { useState } from 'react';

type Props = { onStarted: (id: string | undefined) => void };

export default function TransactionForm({ onStarted }: Props) {
  const [form, setForm] = useState({
    userId: 'u1',
    currency: 'ARS',
    fromAccount: 'AR-123',
    toAccount: 'AR-987',
    amount: 1000,
    description: 'Pago de servicios',
  });
  const upd = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5 shadow-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Nueva Transacción</h2>
        <p className="text-slate-400 text-sm">Iniciá una transferencia bancaria</p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          onStarted(undefined); // resetea timeline

          const res = await fetch('/api/transactions', {
            method:'POST',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({
              userId: form.userId,
              currency: form.currency,
              fromAccount: form.fromAccount,
              toAccount: form.toAccount,
              amount: form.amount,
              description: form.description,
            }),
          });
          const data = await res.json();
          if (data?.transactionId) onStarted(data.transactionId);
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div className="space-y-1">
          <label className="text-xs text-slate-400">User ID</label>
          <input className="input" value={form.userId} onChange={e=>upd('userId', e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Moneda</label>
          <select className="input" value={form.currency} onChange={e=>upd('currency', e.target.value)}>
            <option>ARS</option>
            <option>USD</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Desde (Cuenta)</label>
          <input className="input" value={form.fromAccount} onChange={e=>upd('fromAccount', e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Hacia (Cuenta)</label>
          <input className="input" value={form.toAccount} onChange={e=>upd('toAccount', e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Monto</label>
          <input type="number" className="input" value={form.amount} onChange={e=>upd('amount', Number(e.target.value))} />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-slate-400">Descripción (opcional)</label>
          <input className="input" value={form.description} onChange={e=>upd('description', e.target.value)} />
        </div>

        <div className="md:col-span-2 flex items-center gap-2 pt-2">
          <button className="btn-primary">Iniciar transacción</button>
          <button
            type="button"
            onClick={() => setForm({ userId:'u1', currency:'ARS', fromAccount:'AR-123', toAccount:'AR-987', amount:1000, description:'Pago de servicios' })}
            className="btn-ghost"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
