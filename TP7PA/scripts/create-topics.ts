import { Kafka } from 'kafkajs';

async function main() {
  const kafka = new Kafka({
    clientId: 'admin',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [
      { topic: 'txn.commands', numPartitions: 3, replicationFactor: 1 },
      { topic: 'txn.events',   numPartitions: 3, replicationFactor: 1 },
      { topic: 'txn.dlq',      numPartitions: 1, replicationFactor: 1 },
    ],
    waitForLeaders: true,
  });
  console.log('Topics ready');
  await admin.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
