<p align="center">
  <img src="./assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

# SyntropyLog Examples

Welcome to the SyntropyLog examples. This section is designed to guide you through the framework's features, from the most basic setup to the most advanced use cases.

We recommend following the examples in order for a progressive learning experience.

## Learning Path

Here is a list of the examples in the recommended order. The numbering is spaced out to allow for new examples to be added in the future without requiring a full re-numbering.

- **`01-hello-world`**: ✅ **Ready** - The perfect starting point. Learn how to instantiate and use the logger in under 5 minutes.

- **`10-basic-context`**: 🚧 **WIP** - Learn the fundamental concept of automatic context propagation for tracing operations across function calls.

- **`20-context-ts`**: 🚧 **WIP** - See how to integrate SyntropyLog into a TypeScript project to leverage type-safe configuration.

- **`30-data-masking`**: 🚧 **WIP** - Learn how to protect sensitive data by automatically redacting it from your logs, a critical feature for security and compliance.

- **`40-basic-http-correlation`**: 🚧 **WIP** - Discover how to use a built-in adapter (`axios`) to automatically propagate correlation IDs over HTTP calls.

- **`45-custom-http-adapter`**: 🚧 **WIP** - A more advanced example showing how to build your own adapter for a client that isn't supported out-of-the-box (`got`).

- **`50-basic-kafka-correlation`**: 🚧 **WIP** - Explore how to integrate SyntropyLog with messaging systems like Kafka.

- **`60-advanced-rabbitmq-broker`**: 🚧 **WIP** - Dive deeper into message broker integration with an advanced example using RabbitMQ.

- **`70-full-stack-correlation`**: 🚧 **WIP** - A comprehensive example showing how to correlate logs across multiple services.

- **`80-full-stack-nats`**: 🚧 **WIP** - An advanced microservices architecture example using NATS.

- **`90-custom-transport-compliance`**: 🚧 **WIP** - Learn how to build a custom transport to ship logs to an external collector (like Fluent Bit), a foundational pattern for compliance and centralized logging.

- **`100-custom-serializers`**: 🚧 **WIP** - Shows how to create a custom serializer to safely log complex objects from libraries like Prisma, redacting sensitive data.

- **`110-diagnostics-doctor`**: 🚧 **WIP** - Learn how to use the command-line "doctor" to audit your configuration, enforce best practices, and create custom diagnostic rules.

## How to Run the Examples

Each example is a self-contained Node.js project. To run it, navigate to the example's directory (e.g., `cd examples/01-hello-world`) and follow the instructions in its own `README.md`. Generally, the steps are:

```bash
cd <example-directory>
npm install
npm start
``` 