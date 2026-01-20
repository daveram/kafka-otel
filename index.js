const { Kafka, logLevel } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
const topic = process.env.KAFKA_TOPIC || 'otel-demo';
const groupId = process.env.KAFKA_GROUP_ID || 'otel-demo-consumer';
const clientId = process.env.KAFKA_CLIENT_ID || 'otel-demo-client';

const kafka = new Kafka({
  clientId,
  brokers,
  logLevel: logLevel.INFO,
});

const admin = kafka.admin();
const consumer = kafka.consumer({ groupId });

const ensureTopic = async () => {
  await admin.connect();
  const topics = await admin.listTopics();
  if (!topics.includes(topic)) {
    await admin.createTopics({
      topics: [
        {
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
  }
  await admin.disconnect();
};

const run = async () => {
  await ensureTopic();
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message, partition }) => {
      const value = message.value ? message.value.toString() : '';
      console.log(
        `Received message on ${topic} partition ${partition}: ${value}`
      );
    },
  });
};

const shutdown = async () => {
  await consumer.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run().catch(async (error) => {
  console.error('Kafka consumer failed to start:', error);
  await consumer.disconnect();
  process.exit(1);
});
