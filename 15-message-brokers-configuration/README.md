<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 15: Message Brokers Configuration 📨

> **Core Framework Feature** - Understanding how to configure SyntropyLog's message broker integration with multiple instances and context propagation.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's message broker configuration:

- **Multiple instances**: Configuring different broker clients for different purposes
- **Broker types**: Working with different message brokers (Kafka, RabbitMQ, NATS)
- **Context propagation**: Automatically propagating correlation context in messages
- **Logging configuration**: Controlling what gets logged for broker operations

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                Message Brokers Configuration                    │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Instances   │ │ Broker      │ │ Context     │ │ Logging     │ │
│ │             │ │ Types       │ │ Propagation │ │ Config      │ │
│ │             │ │             │ │             │ │             │ │
│ │ • orders    │ │ • Kafka     │ │ • Headers   │ │ • Success   │ │
│ │ • payments  │ │ • RabbitMQ  │ │ • Correlation│ │ • Error     │ │
│ │ • events    │ │ • NATS      │ │ • Business  │ │ • Messages  │ │
│ │ • analytics │ │ • Custom    │ │ • Custom    │ │ • Timing    │ │
│ │ • default   │ │ • Multiple  │ │ • Automatic │ │ • Headers   │ │
│ │ • named     │ │ • Conditional│ │ • Manual    │ │ • Body      │ │
│ │ • aliased   │ │ • Environment│ │ • Selective │ │ • Performance│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Multiple Instances:**
- **Instance naming**: Giving meaningful names to broker clients
- **Default instance**: Setting up a default broker client
- **Named instances**: Creating specific clients for different purposes
- **Instance management**: Organizing multiple broker clients

### **Broker Types:**
- **Kafka**: Apache Kafka configuration and usage
- **RabbitMQ**: RabbitMQ configuration and usage
- **NATS**: NATS configuration and usage
- **Custom brokers**: Creating custom broker adapters
- **Multiple brokers**: Using different brokers simultaneously

### **Context Propagation:**
- **Automatic propagation**: Correlation context propagated automatically
- **Message headers**: Adding context to message headers
- **Business context**: Propagating business-specific context
- **Selective propagation**: Choosing what context to propagate

### **Logging Configuration:**
- **Success logging**: Controlling what gets logged for successful operations
- **Error logging**: Configuring error logging for failed operations
- **Message logging**: Logging message details (headers, body)
- **Timing information**: Including operation duration in logs
- **Performance monitoring**: Monitoring broker performance

## 🚀 Implementation Plan

### **Phase 1: Basic Broker Configuration**
- [ ] Single broker instance setup
- [ ] Basic broker type configuration
- [ ] Default instance configuration
- [ ] Simple context propagation

### **Phase 2: Multiple Instances**
- [ ] Multiple broker instances
- [ ] Named instance configuration
- [ ] Instance-specific settings
- [ ] Default instance selection

### **Phase 3: Advanced Configuration**
- [ ] Different broker types
- [ ] Advanced context propagation
- [ ] Conditional logging
- [ ] Performance optimization

### **Phase 4: Real-World Patterns**
- [ ] Event-driven patterns
- [ ] Microservice patterns
- [ ] CQRS patterns
- [ ] Production patterns

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Multiple broker instances** configured correctly
- ✅ **Different broker types** working together
- ✅ **Context propagation** working automatically
- ✅ **Logging configuration** properly set up

### **Learning Outcomes:**
- ✅ **How to configure brokers** for different purposes
- ✅ **Broker selection** strategies
- ✅ **Context propagation** patterns
- ✅ **Broker logging** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of message broker concepts
- Familiarity with examples 00-14 (basic setup through Redis configuration)

## 📝 Notes for Implementation

- **Start simple**: Single broker instance first
- **Add complexity gradually**: One instance at a time
- **Focus on practical use**: Show real broker scenarios
- **Document patterns**: Explain when to use what
- **Real-world examples**: Show practical use cases

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's message broker configuration with simple, practical examples. 