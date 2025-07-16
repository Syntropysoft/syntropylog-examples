"use strict";
// =================================================================
//  FILE: src/kafka-client.ts
//  RESPONSIBILITY: Create and export the SINGLE instance (singleton)
//  of our adapter. This is the only place where Kafka is configured.
// =================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.myKafkaBusAdapter = void 0;
const kafkajs_1 = require("kafkajs");
const KafkaAdapter_1 = require("./KafkaAdapter");
const KAFKA_BROKERS = ['localhost:9092'];
// 1. The Kafka instance is created ONCE.
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app-client',
    brokers: KAFKA_BROKERS,
    logLevel: kafkajs_1.logLevel.ERROR,
});
// 2. The adapter is created by passing it the Kafka instance.
const kafkaAdapter = new KafkaAdapter_1.KafkaAdapter(kafka, 'my-app-group');
// 3. The adapter instance is exported for the entire app to use.
exports.myKafkaBusAdapter = kafkaAdapter;
