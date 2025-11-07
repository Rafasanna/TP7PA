import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'bank-txn-app',
  brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export async function ensureProducer() {
  await producer.connect();
  return producer;
}
