import { NextRequest, NextResponse } from 'next/server';
import { ensureProducer } from '@/lib/kafka';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromAccount, toAccount, amount, currency, userId } = body || {};

    if (!fromAccount || !toAccount || !amount || !currency || !userId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const transactionId = uuid();
    const event = {
      eventId: uuid(),
      type: 'TransactionInitiated',
      transactionId,
      userId,
      timestamp: new Date().toISOString(),
      payload: { fromAccount, toAccount, amount, currency, userId },
    };

    const p = await ensureProducer();
    await p.send({
      topic: 'txn.commands',
      messages: [{ key: transactionId, value: JSON.stringify(event) }],
    });

    return NextResponse.json({ ok: true, transactionId });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'error' }, { status: 500 });
  }
}
