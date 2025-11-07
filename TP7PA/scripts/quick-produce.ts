import { Kafka } from 'kafkajs';

async function main() {
  const kafka = new Kafka({
    clientId: 'quick-producer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: 'txn.commands',
    messages: [{ key: 'TEST-TXN', value: JSON.stringify({ hello: 'world', ts: Date.now() }) }],
  });
  console.log('Produced message to txn.commands');
  await producer.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
