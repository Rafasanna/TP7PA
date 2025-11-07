'use client';
import { useState } from 'react';
import TransactionForm from '../components/transaction-form';
import TransactionTimeline from '../components/transaction-timeline';
import ConnectionStatus from '../components/connection-status';

export default function Page() {
  const [txnId, setTxnId] = useState<string | undefined>(undefined);
  const [sseStatus, setSseStatus] = useState<'idle'|'connecting'|'open'|'error'>('idle');

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col">
      {/* Topbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900 shadow-lg sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold">Sistema de Eventos Bancarios</h1>
          <p className="text-slate-400 text-xs">Trabajo7 – Rafaela Sanna</p>
        </div>
        <ConnectionStatus status={sseStatus} />
      </header>

      {/* Grid 2 columnas */}
      <section className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TransactionForm onStarted={setTxnId} />
        <TransactionTimeline transactionId={txnId} onStatusChange={setSseStatus} />
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800">
        UADER – Programación Avanzada · 2025
      </footer>
    </main>
  );
}
