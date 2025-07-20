<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>
# SyntropyLog Examples

Welcome to the SyntropyLog examples. This section is designed to guide you through the framework's features, from the most basic setup to the most advanced use cases.

## 🚨 **TRANSPARENCY NOTICE**

**We believe in complete honesty about our project status.** This is an alpha release with examples in various stages of completion. We've tested what we can and documented what needs external services.

### **What We Guarantee:**
- ✅ **Examples 00-13**: Fully tested and working
- ✅ **Examples 20-22**: Tested with external services (Kafka, RabbitMQ, NATS)
- ✅ **All examples compile** and have proper TypeScript configuration

### **What Requires External Setup:**
- 🐳 **Examples 12, 13, 20, 21, 22**: Need Docker services (Redis, Kafka, RabbitMQ, NATS)
- 🔧 **Example 23**: Needs Kafka setup (not tested yet)

### **What's Still in Development:**
- 🚧 **Examples 30+**: Advanced patterns (NestJS, GraphQL, etc.)

## 📖 Table of Contents

## Learning Path

Here is a list of the examples organized by category. The numbering follows a logical progression from basic concepts to advanced patterns:

### Foundation (00-09) ✅ **COMPLETE & TESTED**
- **`00-setup-initialization`**: ✅ **Complete** - Learn how to properly initialize SyntropyLog with event handling and graceful shutdown.
- **`01-hello-world`**: ✅ **Complete** - The perfect starting point for logging. Learn basic logging concepts in under 5 minutes.
- **`02-basic-context`**: ✅ **Complete** - Learn the fundamental concept of automatic context propagation for tracing operations across function calls.
- **`03-context-ts`**: ✅ **Complete** - TypeScript integration with interfaces for context management and correlation.

### HTTP Clients & Redis (10-19) ✅ **COMPLETE & TESTED**
- **`10-basic-http-correlation`**: ✅ **Complete** - Discover how to use a built-in adapter (`axios`) to automatically propagate correlation IDs over HTTP calls.
- **`11-custom-adapter`**: ✅ **Complete** - A more advanced example showing how to build your own adapter for a client that isn't supported out-of-the-box (`fetch`).
- **`12-http-redis-axios`**: ✅ **Complete** - Complete system architecture with Redis caching, HTTP clients, and Express server. Production-ready patterns.
- **`13-http-redis-fastify`**: ✅ **Complete** - Same functionality as example 12 but using Fastify instead of Express. Framework agnosticism demonstration.

### Message Brokers (20-29) ✅ **MOSTLY TESTED**
- **`20-basic-kafka-correlation`**: ✅ **Tested with Docker** - Explore how to integrate SyntropyLog with messaging systems like Kafka using the official adapter. **Requires Kafka via Docker.**
- **`21-basic-rabbitmq-broker`**: ✅ **Tested with Docker** - Basic RabbitMQ integration example. **Requires RabbitMQ via Docker.**
- **`22-basic-nats-broker`**: ✅ **Tested with Docker** - Basic NATS integration example. **Requires NATS via Docker.**
- **`23-kafka-full-stack`**: 🚧 **Needs Testing** - A comprehensive example showing how to correlate logs across multiple services using Kafka. **Requires Kafka setup.**
- **`24-full-stack-nats`**: 🚧 **In Progress** - Advanced microservices architecture example using NATS.
- **`25-multi-redis-kafks-nats-axios`**: 🚧 **In Progress** - Multi-service architecture with Redis, Kafka, NATS, and Axios.
- **`29-advanced-rabbitmq-broker`**: 🚧 **In Progress** - Advanced RabbitMQ patterns and enterprise features.

### Backend Frameworks (30-39) 🚧 **IN DEVELOPMENT**
- **`30-data-masking`**: 🚧 **In Progress** - Learn how to protect sensitive data by automatically redacting it from your logs.
- **`31-http-redis-nestjs`**: 🚧 **In Progress** - NestJS framework integration with Redis and HTTP correlation.
- **`32-redis-GraphQL`**: 🚧 **In Progress** - GraphQL integration with Redis and correlation patterns.
- **`33-kafka-enterprise-patterns`**: 🚧 **In Progress** - Kafka Streams, Exactly Once semantics, Schema Registry, and enterprise-grade streaming.
- **`34-nats-enterprise-patterns`**: 🚧 **In Progress** - NATS JetStream, clustering, consumer groups, and high-performance messaging.
- **`35-microservices-saga`**: 🚧 **In Progress** - Cross-service saga orchestration with distributed transactions.
- **`36-event-sourcing-cqrs`**: 🚧 **In Progress** - Complete event sourcing with CQRS pattern implementation.
- **`37-circuit-breaker-patterns`**: 🚧 **In Progress** - Resilience patterns for fault-tolerant distributed systems.
- **`38-distributed-tracing`**: 🚧 **In Progress** - Jaeger/Zipkin integration for distributed tracing.
- **`39-observability-dashboard`**: 🚧 **In Progress** - Grafana/Prometheus integration for comprehensive monitoring.

### Advanced Patterns (40+) 🚧 **IN DEVELOPMENT**
- **`41-custom-serializers`**: 🚧 **In Progress** - Shows how to create a custom serializer to safely log complex objects.
- **`42-compliance-retention`**: 🚧 **In Progress** - Learn how to build a custom transport for compliance and centralized logging.
- **`44-private-package-registry`**: 🚧 **In Progress** - Setup and configuration for private package registries.
- **`45-github-packages-consumer`**: 🚧 **In Progress** - Integration with GitHub packages for distribution.

### Diagnostics & Analysis (50+) 🚧 **IN DEVELOPMENT**
- **`50-diagnostics-doctor`**: ✅ **OPERATIONAL** - The ultimate observability framework analyzer. Diagnose, validate, and optimize any SyntropyLog implementation with enterprise-grade insights. **Ready for production use today!**
- **`51-diagnostics-comparison`**: 🚧 **In Progress** - Compare different configuration approaches and identify the optimal setup for your specific use case with performance benchmarking and migration planning.
- **`52-diagnostics-performance`**: 🚧 **In Progress** - Comprehensive performance analysis and optimization with bottleneck detection, load testing, and automatic tuning recommendations.
- **`53-diagnostics-security`**: 🚧 **In Progress** - Security analysis and compliance validation with vulnerability detection, SOC2/GDPR/HIPAA compliance, and security hardening recommendations.

## 🧪 **Testing Status**

### ✅ **Fully Tested (No External Dependencies)**
- Examples 00, 01, 02, 03, 10, 11

### ✅ **Tested with Docker Services**
- Example 12: Redis + Express
- Example 13: Redis + Fastify
- Example 20: Kafka (with official adapter)
- Example 21: RabbitMQ
- Example 22: NATS

### 🚧 **In Development**
- Examples 23-29: Advanced broker patterns
- Examples 30-39: Backend frameworks & Enterprise patterns (NestJS, GraphQL, Kafka Streams, NATS JetStream, Saga, CQRS, Circuit Breaker, Tracing, Monitoring)
- Examples 41-45: Advanced patterns (serializers, compliance, etc.)
- Examples 51-53: Diagnostics & analysis tools (comparison, performance, security)

### ✅ **Operational Tools**
- Example 50: Diagnostics doctor (fully functional, ready for production)

## 🐳 **Docker Setup for Examples**

Some examples require external services. We provide Docker Compose files for easy setup:

### **Example 12 (Redis + Express)**
```bash
cd 12-http-redis-axios
docker-compose up -d redis
npm install
npm run dev
```

### **Example 13 (Fastify)**
```bash
cd 13-http-redis-fastify
docker-compose up -d redis
npm install
npm run dev
```

### **Example 20 (Kafka)**
```bash
cd 20-basic-kafka-correlation
docker-compose up -d
npm install
npm run dev
```

### **Example 21 (RabbitMQ)**
```bash
cd 21-basic-rabbitmq-broker
docker-compose up -d rabbitmq
npm install
npm run dev
```

### **Example 22 (NATS)**
```bash
cd 22-basic-nats-broker
docker-compose up -d nats
npm install
npm run dev
```

## How to Run the Examples

Each example is a self-contained Node.js project. To run it, navigate to the example's directory and follow the instructions in its own `README.md`. Generally, the steps are:

```bash
cd <example-directory>
npm install
npm run dev
```

## Example Structure

### Foundation Examples (00-09) ✅ **COMPLETE**
- **00-setup-initialization**: Application setup and initialization
- **01-hello-world**: Basic logging concepts
- **02-basic-context**: Context management and correlation
- **03-context-ts**: TypeScript integration with interfaces

### HTTP Clients & Redis (10-19) ✅ **COMPLETE**
- **10-basic-http-correlation**: HTTP request correlation with built-in adapters
- **11-custom-adapter**: Custom HTTP client adapters (fetch)
- **12-http-redis-axios**: Complete system architecture with Redis + HTTP + Express
- **13-http-redis-fastify**: Same as 12 but using Fastify instead of Express

### Message Brokers (20-29) ✅ **MOSTLY COMPLETE**
- **20-basic-kafka-correlation**: Kafka message broker integration (tested with Docker)
- **21-basic-rabbitmq-broker**: RabbitMQ integration (tested with Docker)
- **22-basic-nats-broker**: NATS integration (tested with Docker)
- **23-kafka-full-stack**: Kafka distributed tracing (needs testing)
- **24-full-stack-nats**: Advanced NATS microservices architecture
- **25-multi-redis-kafks-nats-axios**: Multi-service architecture
- **29-advanced-rabbitmq-broker**: Advanced RabbitMQ patterns

### Backend Frameworks (30-39) 🚧 **IN DEVELOPMENT**
- **30-data-masking**: Security and data protection
- **31-http-redis-nestjs**: NestJS framework integration
- **32-redis-GraphQL**: GraphQL integration
- **33-kafka-enterprise-patterns**: Kafka Streams, Exactly Once, Schema Registry
- **34-nats-enterprise-patterns**: NATS JetStream, clustering, consumer groups
- **35-microservices-saga**: Cross-service saga orchestration
- **36-event-sourcing-cqrs**: Event sourcing with CQRS
- **37-circuit-breaker-patterns**: Resilience patterns
- **38-distributed-tracing**: Jaeger/Zipkin integration
- **39-observability-dashboard**: Grafana/Prometheus monitoring

### Advanced Patterns (40+) 🚧 **IN DEVELOPMENT**
- **41-custom-serializers**: Custom data handling
- **42-compliance-retention**: Compliance and log retention
- **44-private-package-registry**: Package management
- **45-github-packages-consumer**: GitHub packages integration

### Diagnostics & Analysis (50+) 🚧 **IN DEVELOPMENT**
- **50-diagnostics-doctor**: ✅ **OPERATIONAL** - The ultimate observability framework analyzer. Diagnose, validate, and optimize any SyntropyLog implementation with enterprise-grade insights. **Ready for production use today!**
- **51-diagnostics-comparison**: Compare different configuration approaches and identify the optimal setup for your specific use case with performance benchmarking and migration planning.
- **52-diagnostics-performance**: Comprehensive performance analysis and optimization with bottleneck detection, load testing, and automatic tuning recommendations.
- **53-diagnostics-security**: Security analysis and compliance validation with vulnerability detection, SOC2/GDPR/HIPAA compliance, and security hardening recommendations.

## Current Status Summary

### ✅ **Production Ready (15/45)**
- **Foundation**: 00, 01, 02, 03
- **HTTP & Redis**: 10, 11, 12, 13
- **Message Brokers**: 20, 21, 22 (with Docker)
- **Diagnostics**: 50 (doctor - operational)

### 🚧 **Needs External Setup (1/45)**
- **Message Brokers**: 23 (Kafka required)

### 🚧 **In Development (39/45)**
- **Message Brokers**: 24, 25, 29 (advanced patterns)
- **Backend Frameworks**: 30, 31, 32, 33, 34, 35, 36, 37, 38, 39 (Enterprise patterns)
- **Advanced Patterns**: 41, 42, 44, 45
- **Diagnostics**: 51, 52, 53 (comparison, performance, security)

## Version Information

This examples collection is compatible with **SyntropyLog v0.6.4-alpha.0+**. The examples have been tested and verified to work with the latest alpha release.

For the best experience, ensure you're using the same version as specified in each example's `package.json` file. 

> **⚠️ Alpha Version Notice**: This is an alpha release. Features may change before the stable release. For production use, wait for the stable version.

## 🤝 **Contributing**

We welcome contributions! If you find issues or want to improve examples:

1. **Test with external services** and document setup requirements
2. **Add Docker Compose files** for examples that need external dependencies
3. **Update this README** with accurate status information
4. **Follow our transparency principle** - be honest about what works and what doesn't

## 📝 **Our Testing Philosophy**

We believe in **field testing over complex mocks**. Our examples are designed to work with real services rather than heavily mocked unit tests. This gives you confidence that the patterns actually work in production environments.

**What we test:**
- ✅ Our own code and patterns
- ✅ Integration with real external services
- ✅ Complete working examples

**What we don't test:**
- ❌ External libraries (they have their own tests)
- ❌ Complex mocked scenarios that don't reflect reality 