import { NextRequest } from 'next/server';
import { Kafka } from 'kafkajs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transactionId');
  if (!transactionId) return new Response('transactionId required', { status: 400 });

  console.log('[WS] connect txn=', transactionId);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const write = (obj: any) =>
    writer.write(new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`));

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  } as const;

  // Mensaje de bienvenida
  write({ type: 'connected', txn: transactionId, at: new Date().toISOString() });

  const kafka = new Kafka({
    clientId: 'gateway',
    brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
  });

  // 👇 grupo SIEMPRE único para evitar offsets previos
  const consumer = kafka.consumer({ groupId: `gateway-${transactionId}-${Date.now()}` });

  await consumer.connect();
  await consumer.subscribe({ topic: 'txn.events', fromBeginning: true }); // leer histórico

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const key = message.key?.toString();
      const raw = message.value?.toString() || '{}';
      if (!key) return;

      // Logs de depuración en el server
      if (key === transactionId) {
        const parsed = JSON.parse(raw);
        console.log('[WS] send', parsed.type, 'txn=', key, 'part=', partition);
        await write(parsed);
      } else {
        // Descomenta si querés ver keys que pasan pero no matchean
        // console.log('[WS] skip key=', key);
      }
    },
  });

  const ping = setInterval(() => write({ type: 'ping', at: new Date().toISOString() }), 15000);

  const close = async () => {
    clearInterval(ping);
    try { await consumer.disconnect(); } catch {}
    try { await writer.close(); } catch {}
    console.log('[WS] close txn=', transactionId);
  };

  // cerrar cuando el cliente cierra
  // @ts-ignore
  req.signal?.addEventListener?.('abort', close);

  return new Response(readable, { headers });
}
