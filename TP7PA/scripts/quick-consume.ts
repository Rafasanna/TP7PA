import { Kafka } from 'kafkajs';

const txnId = process.env.TXN_ID || ''; // poné acá tu id si querés hardcodearlo

async function main() {
  const kafka = new Kafka({
    clientId: 'quick-consumer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });
  const consumer = kafka.consumer({ groupId: 'quick-consumer-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'txn.events', fromBeginning: true });

  console.log('Listening txn.events... filter txnId =', txnId || '(none)');
  await consumer.run({
    eachMessage: async ({ message }) => {
      const key = message.key?.toString();
      const val = message.value?.toString() || '{}';
      if (!txnId || key === txnId) {
        console.log('---');
        console.log('key:', key);
        console.log(val);
      }
    }
  });
}
main().catch(e => { console.error(e); process.exit(1); });
