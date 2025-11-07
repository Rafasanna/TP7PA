'use client';
import { useEffect, useState } from 'react';

export default function ConnectionStatus({ status }: { status: 'idle'|'connecting'|'open'|'error' }) {
  const bg =
    status === 'open' ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' :
    status === 'connecting' ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' :
    status === 'error' ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30' :
    'bg-slate-600/30 text-slate-300 ring-1 ring-slate-500/30';
  const label =
    status === 'open' ? 'Conectado' :
    status === 'connecting' ? 'Conectando…' :
    status === 'error' ? 'Desconectado' : 'Listo';
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${bg}`}>
      {label}
    </span>
  );
}
