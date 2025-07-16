"use strict";
// =================================================================
//  ARCHIVO 2 (Corregido): src/kafka-client.ts
//  RESPONSABILIDAD: Crear y exportar la ÚNICA instancia (singleton)
//  de nuestro adaptador. Es el único lugar donde se configura Kafka.
// =================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.myKafkaBusAdapter = void 0;
const kafkajs_1 = require("kafkajs");
const KafkaAdapter_1 = require("./KafkaAdapter");
const KAFKA_BROKERS = ['localhost:9092'];
// 1. Se crea la instancia de Kafka UNA SOLA VEZ.
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app-client',
    brokers: KAFKA_BROKERS,
    logLevel: kafkajs_1.logLevel.ERROR,
});
// 2. Se crea el adaptador pasándole la instancia de Kafka.
const kafkaAdapter = new KafkaAdapter_1.KafkaAdapter(kafka, 'my-app-group');
// 3. Se exporta la instancia del adaptador para que toda la app la use.
exports.myKafkaBusAdapter = kafkaAdapter;
//# sourceMappingURL=kafka-client.js.map