<p align="center">
  <img src="./assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

# SyntropyLog Examples

Welcome to the SyntropyLog examples. This section is designed to guide you through the framework's features, from the most basic setup to the most advanced use cases.

We recommend following the examples in order for a progressive learning experience.

## Learning Path

Here is a list of the examples in the recommended order. The numbering is spaced out to allow for new examples to be added in the future without requiring a full re-numbering.

- **`00-setup-initialization`**: ✅ **Complete** - Learn how to properly initialize SyntropyLog with event handling and graceful shutdown.

- **`01-hello-world`**: ✅ **Complete** - The perfect starting point for logging. Learn basic logging concepts in under 5 minutes. **Updated for v0.5.8**.

- **`10-basic-context`**: 🚧 **In Progress** - Learn the fundamental concept of automatic context propagation for tracing operations across function calls.

- **`20-context-ts`**: 🚧 **In Progress** - See how to integrate SyntropyLog into a TypeScript project to leverage type-safe configuration.

- **`30-data-masking`**: 🚧 **In Progress** - Learn how to protect sensitive data by automatically redacting it from your logs, a critical feature for security and compliance.

- **`40-basic-http-correlation`**: 🚧 **In Progress** - Discover how to use a built-in adapter (`axios`) to automatically propagate correlation IDs over HTTP calls.

- **`45-custom-http-adapter`**: 🚧 **In Progress** - A more advanced example showing how to build your own adapter for a client that isn't supported out-of-the-box (`got`).

- **`50-basic-kafka-correlation`**: 🚧 **In Progress** - Explore how to integrate SyntropyLog with messaging systems like Kafka.

- **`60-advanced-rabbitmq-broker`**: 🚧 **In Progress** - Dive deeper into message broker integration with an advanced example using RabbitMQ.

- **`70-full-stack-correlation`**: 🚧 **In Progress** - A comprehensive example showing how to correlate logs across multiple services.

- **`75-full-stack-correlation-http-redis`**: 🚧 **In Progress** - Advanced example showing HTTP + Redis correlation patterns.

- **`80-full-stack-nats`**: 🚧 **In Progress** - An advanced microservices architecture example using NATS.

- **`90-compliance-retention`**: 🚧 **In Progress** - Learn how to build a custom transport to ship logs to an external collector (like Fluent Bit), a foundational pattern for compliance and centralized logging.

- **`100-custom-serializers`**: 🚧 **In Progress** - Shows how to create a custom serializer to safely log complex objects from libraries like Prisma, redacting sensitive data.

- **`110-diagnostics-doctor`**: 🚧 **In Progress** - Learn how to use the command-line "doctor" to audit your configuration, enforce best practices, and create custom diagnostic rules.

- **`120-private-package-registry`**: 🚧 **In Progress** - Setup and configuration for private package registries.

- **`130-github-packages-consumer`**: 🚧 **In Progress** - Integration with GitHub packages for distribution.

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

### Core Concepts (10-39)
- **10-basic-context**: Context management and correlation
- **20-context-ts**: TypeScript integration
- **30-data-masking**: Security and data protection

### Integration Examples (40-69)
- **40-basic-http-correlation**: HTTP request correlation
- **50-basic-kafka-correlation**: Message broker integration
- **60-advanced-rabbitmq-broker**: Advanced broker patterns

### Advanced Patterns (70-99)
- **70-full-stack-correlation**: Distributed tracing
- **80-full-stack-nats**: Microservices architecture

### Production & Compliance (100+)
- **100-custom-serializers**: Custom data handling
- **110-diagnostics-doctor**: Configuration validation
- **120-private-package-registry**: Package management

## Version Information

This examples collection is compatible with **SyntropyLog v0.5.8+**. The examples have been tested and verified to work with the latest stable release.

For the best experience, ensure you're using the same version as specified in each example's `package.json` file. 