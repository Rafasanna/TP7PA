import { Kafka, Partitioners } from 'kafkajs';
import { v4 as uuid } from 'uuid';

const kafka = new Kafka({
  clientId: 'orchestrator',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'orchestrator-commands' });
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

type Env = {
  eventId: string;
  type: string;
  transactionId: string;
  userId: string;
  timestamp: string;
  payload: any;
};

async function emit(evtType: string, base: Env, payload: any) {
  // 👇 acá sí existe evtType
  console.log('[EMIT]', evtType, 'txn=', base.transactionId);

  await producer.send({
    topic: 'txn.events',
    messages: [
      {
        key: base.transactionId,
        value: JSON.stringify({
          eventId: uuid(),
          type: evtType,
          transactionId: base.transactionId,
          userId: base.userId,
          timestamp: new Date().toISOString(),
          payload,
        }),
      },
    ],
  });
}

async function run() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'txn.commands', fromBeginning: false });

  console.log('Orchestrator ready. Waiting for commands…');

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString() || '{}';
      const evt = JSON.parse(raw) as Env;

      // 👇 log de recepción
      console.log('[RECV]', evt.type, 'txn=', evt.transactionId);

      if (evt.type !== 'TransactionInitiated') return;

      // 1) Reserva de fondos
      await emit('FundsReserved', evt, { ok: true, holdId: uuid(), amount: evt.payload.amount });

      // 2) Antifraude
      const risk = Math.random() < 0.8 ? 'LOW' : 'HIGH';
      await emit('FraudChecked', evt, { risk });

      // 3) Commit o Reverse
      if (risk === 'LOW') {
        await emit('Committed', evt, { ledgerTxId: uuid() });
      } else {
        await emit('Reversed', evt, { reason: 'FRAUD_RISK' });
      }

      // 4) Notificación final
      await emit('Notified', evt, { channels: ['push', 'email'] });
    },
  });
}

run().catch((err) => {
  console.error('Orchestrator crashed:', err);
  process.exit(1);
});
