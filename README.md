<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>
## 📖 Table of Contents

# SyntropyLog Examples

Welcome to the SyntropyLog examples. This section is designed to guide you through the framework's features, from the most basic setup to the most advanced use cases.

We recommend following the examples in order for a progressive learning experience.

## Learning Path

Here is a list of the examples organized by category. The numbering follows a logical progression from basic concepts to advanced patterns:

### Foundation (00-09)
- **`00-setup-initialization`**: ✅ **Complete** - Learn how to properly initialize SyntropyLog with event handling and graceful shutdown.
- **`01-hello-world`**: ✅ **Complete** - The perfect starting point for logging. Learn basic logging concepts in under 5 minutes. **Updated for v0.5.8**.
- **`02-basic-context`**: ✅ **Complete** - Learn the fundamental concept of automatic context propagation for tracing operations across function calls.

### HTTP Clients & Redis (10-19)
- **`10-basic-http-correlation`**: 🚧 **In Progress** - Discover how to use a built-in adapter (`axios`) to automatically propagate correlation IDs over HTTP calls.
- **`11-custom-http-adapter`**: 🚧 **In Progress** - A more advanced example showing how to build your own adapter for a client that isn't supported out-of-the-box (`got`).
- **`12-redis-correlation`**: 🚧 **In Progress** - Learn how to integrate Redis clients with automatic correlation and context propagation.
- **`13-http-redis-full-stack`**: 🚧 **In Progress** - Advanced example showing HTTP + Redis correlation patterns in a full-stack application.

### Message Brokers (20-29)
- **`20-basic-kafka-correlation`**: 🚧 **In Progress** - Explore how to integrate SyntropyLog with messaging systems like Kafka.
- **`21-advanced-rabbitmq-broker`**: 🚧 **In Progress** - Dive deeper into message broker integration with an advanced example using RabbitMQ.
- **`22-full-stack-nats`**: 🚧 **In Progress** - An advanced microservices architecture example using NATS.
- **`23-kafka-full-stack`**: 🚧 **In Progress** - A comprehensive example showing how to correlate logs across multiple services using Kafka.

### Backend Frameworks (30-39)
- **`30-nestjs-integration`**: 🚧 **In Progress** - Learn how to integrate SyntropyLog with NestJS applications.
- **`31-graphql-correlation`**: 🚧 **In Progress** - Discover how to correlate GraphQL requests and operations.
- **`32-express-middleware`**: 🚧 **In Progress** - See how to create Express.js middleware for automatic correlation.
- **`33-fastify-plugin`**: 🚧 **In Progress** - Learn how to create Fastify plugins for SyntropyLog integration.

### Advanced Patterns (40+)
- **`40-data-masking`**: 🚧 **In Progress** - Learn how to protect sensitive data by automatically redacting it from your logs, a critical feature for security and compliance.
- **`41-custom-serializers`**: 🚧 **In Progress** - Shows how to create a custom serializer to safely log complex objects from libraries like Prisma, redacting sensitive data.
- **`42-compliance-retention`**: 🚧 **In Progress** - Learn how to build a custom transport to ship logs to an external collector (like Fluent Bit), a foundational pattern for compliance and centralized logging.
- **`43-diagnostics-doctor`**: 🚧 **In Progress** - Learn how to use the command-line "doctor" to audit your configuration, enforce best practices, and create custom diagnostic rules.
- **`44-private-package-registry`**: 🚧 **In Progress** - Setup and configuration for private package registries.
- **`45-github-packages-consumer`**: 🚧 **In Progress** - Integration with GitHub packages for distribution.

## How to Run the Examples

Each example is a self-contained Node.js project. To run it, navigate to the example's directory (e.g., `cd 00-setup-initialization`) and follow the instructions in its own `README.md`. Generally, the steps are:

```bash
cd <example-directory>
npm install
npm run dev
```

## Example Structure

### Foundation Examples (00-09)
- **00-setup-initialization**: Application setup and initialization
- **01-hello-world**: Basic logging concepts
- **02-basic-context**: Context management and correlation

### HTTP Clients & Redis (10-19)
- **10-basic-http-correlation**: HTTP request correlation with built-in adapters
- **11-custom-http-adapter**: Custom HTTP client adapters
- **12-redis-correlation**: Redis client integration and correlation
- **13-http-redis-full-stack**: Combined HTTP + Redis patterns

### Message Brokers (20-29)
- **20-basic-kafka-correlation**: Kafka message broker integration
- **21-advanced-rabbitmq-broker**: RabbitMQ advanced patterns
- **22-full-stack-nats**: NATS microservices architecture
- **23-kafka-full-stack**: Kafka distributed tracing

### Backend Frameworks (30-39)
- **30-nestjs-integration**: NestJS framework integration
- **31-graphql-correlation**: GraphQL request correlation
- **32-express-middleware**: Express.js middleware patterns
- **33-fastify-plugin**: Fastify plugin integration

### Advanced Patterns (40+)
- **40-data-masking**: Security and data protection
- **41-custom-serializers**: Custom data handling
- **42-compliance-retention**: Compliance and log retention
- **43-diagnostics-doctor**: Configuration validation
- **44-private-package-registry**: Package management
- **45-github-packages-consumer**: GitHub packages integration

## Version Information

This examples collection is compatible with **SyntropyLog v0.6.1-alpha.0+**. The examples have been tested and verified to work with the latest alpha release.

For the best experience, ensure you're using the same version as specified in each example's `package.json` file. 

> **⚠️ Alpha Version Notice**: This is an alpha release. Features may change before the stable release. For production use, wait for the stable version. 