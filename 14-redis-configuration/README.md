<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 14: Redis Configuration 🔴

> **Core Framework Feature** - Understanding how to configure SyntropyLog's Redis integration with multiple instances, modes, and logging.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's Redis configuration:

- **Multiple instances**: Configuring different Redis clients for different purposes
- **Redis modes**: Working with different Redis configurations (standalone, cluster, sentinel)
- **Logging configuration**: Controlling what gets logged for Redis operations
- **Context integration**: Using Redis with SyntropyLog's context system

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Redis Configuration                         │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Instances   │ │ Modes       │ │ Logging     │ │ Context     │ │
│ │             │ │             │ │ Config      │ │ Integration │ │
│ │             │ │             │ │             │ │             │ │
│ │ • cache     │ │ • Standalone│ │ • Success   │ │ • Correlation│ │
│ │ • session   │ │ • Cluster   │ │ • Error     │ │ • Business  │ │
│ │ • queue     │ │ • Sentinel  │ │ • Commands  │ │ • Custom    │ │
│ │ • analytics │ │ • Replica   │ │ • Timing    │ │ • Automatic │ │
│ │ • default   │ │ • Custom    │ │ • Data      │ │ • Manual    │ │
│ │ • named     │ │ • Environment│ │ • Performance│ │ • Selective │ │
│ │ • aliased   │ │ • Specific  │ │ • Monitoring│ │ • Conditional│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Multiple Instances:**
- **Instance naming**: Giving meaningful names to Redis clients
- **Default instance**: Setting up a default Redis client
- **Named instances**: Creating specific clients for different purposes
- **Instance management**: Organizing multiple Redis clients

### **Redis Modes:**
- **Standalone mode**: Single Redis server configuration
- **Cluster mode**: Redis cluster configuration
- **Sentinel mode**: Redis sentinel configuration
- **Replica mode**: Redis replica configuration
- **Custom modes**: Creating custom Redis configurations

### **Logging Configuration:**
- **Success logging**: Controlling what gets logged for successful operations
- **Error logging**: Configuring error logging for failed operations
- **Command logging**: Logging Redis commands
- **Timing information**: Including operation duration in logs
- **Data logging**: Logging Redis data (with masking)

### **Context Integration:**
- **Correlation context**: Using correlation context with Redis
- **Business context**: Propagating business-specific context
- **Custom context**: Adding custom context to Redis operations
- **Selective context**: Choosing what context to include

## 🚀 Implementation Plan

### **Phase 1: Basic Redis Configuration**
- [ ] Single Redis instance setup
- [ ] Basic mode configuration
- [ ] Default instance configuration
- [ ] Simple context integration

### **Phase 2: Multiple Instances**
- [ ] Multiple Redis instances
- [ ] Named instance configuration
- [ ] Instance-specific settings
- [ ] Default instance selection

### **Phase 3: Advanced Configuration**
- [ ] Different Redis modes
- [ ] Advanced context integration
- [ ] Conditional logging
- [ ] Performance optimization

### **Phase 4: Real-World Patterns**
- [ ] Caching patterns
- [ ] Session storage patterns
- [ ] Queue patterns
- [ ] Production patterns

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Multiple Redis instances** configured correctly
- ✅ **Different modes** working together
- ✅ **Context integration** working automatically
- ✅ **Logging configuration** properly set up

### **Learning Outcomes:**
- ✅ **How to configure Redis** for different purposes
- ✅ **Mode selection** strategies
- ✅ **Context integration** patterns
- ✅ **Redis logging** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of Redis concepts
- Familiarity with examples 00-13 (basic setup through HTTP configuration)

## 📝 Notes for Implementation

- **Start simple**: Single Redis instance first
- **Add complexity gradually**: One instance at a time
- **Focus on practical use**: Show real Redis scenarios
- **Document patterns**: Explain when to use what
- **Real-world examples**: Show practical use cases

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's Redis configuration with simple, practical examples. 