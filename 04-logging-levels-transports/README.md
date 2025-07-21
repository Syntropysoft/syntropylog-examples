<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 04: Logging Levels and Transports 📊

> **Core Framework Feature** - Understanding SyntropyLog's logging levels and transport options for different environments.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's logging system fundamentals:

- **Logging levels**: fatal, error, warn, info, debug, trace, silent
- **Transport options**: Console, JSON transports
- **Environment-specific logging**: Development vs Production
- **Simple configuration**: How to configure logging for different needs

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Logging Configuration                        │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Log Levels  │ │ Transports  │ │ Environment │ │ Performance │ │
│ │             │ │             │ │             │ │             │ │
│ │ • fatal     │ │ • Console   │ │ • Dev       │ │ • Overhead  │ │
│ │ • error     │ │ • JSON      │ │ • Prod      │ │ • Throughput│ │
│ │ • warn      │ │ • Custom    │ │ • Test      │ │ • Memory    │ │
│ │ • info      │ │ • File      │ │ • Staging   │ │ • Latency   │ │
│ │ • debug     │ │ • Remote    │ │ • CI/CD     │ │ • CPU       │ │
│ │ • trace     │ │ • Multiple  │ │ • Docker    │ │ • I/O       │ │
│ │ • silent    │ │ • Conditional│ │ • K8s       │ │ • Network   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Logging Levels:**
- **When to use each level** and why
- **Performance impact** of different levels
- **Production vs Development** level strategies
- **Level filtering** and configuration

### **Transport Options:**
- **Console transports**: Human-readable vs JSON
- **Custom transports**: Creating your own
- **Multiple transports**: Using different outputs simultaneously
- **Conditional transports**: Environment-based selection

### **Environment Strategies:**
- **Development**: Verbose logging for debugging
- **Production**: Minimal logging for performance
- **Testing**: Structured logging for automation
- **Staging**: Balanced approach

### **Simple Configuration:**
- **Development logging**: Verbose logging for debugging
- **Production logging**: Minimal logging for performance
- **Environment detection**: Automatic configuration based on environment
- **Transport selection**: Choosing the right transport for your needs

## 🚀 Implementation Plan

### **Phase 1: Basic Levels**
- [ ] Configure all logging levels
- [ ] Demonstrate level filtering
- [ ] Show performance differences

### **Phase 2: Transport Options**
- [ ] Console transport (pretty vs JSON)
- [ ] Custom transport implementation
- [ ] Multiple transports configuration

### **Phase 3: Environment Strategies**
- [ ] Development configuration
- [ ] Production configuration
- [ ] Environment-based selection

### **Phase 4: Environment Strategies**
- [ ] Development configuration
- [ ] Production configuration
- [ ] Environment-based selection

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **All logging levels** working correctly
- ✅ **Multiple transport options** configured
- ✅ **Environment-specific** logging strategies
- ✅ **Simple configuration** patterns

### **Learning Outcomes:**
- ✅ **When to use which level** for different scenarios
- ✅ **How to configure transports** for different needs
- ✅ **Environment-based** configuration strategies
- ✅ **Simple best practices** for logging

## 🔧 Prerequisites

- Node.js 18+
- Understanding of basic logging concepts
- Familiarity with examples 00-03 (basic setup)

## 📝 Notes for Implementation

- **Start simple**: Basic level configuration first
- **Add complexity gradually**: One transport at a time
- **Focus on practical use**: Show real scenarios
- **Document simple patterns**: Explain when to use what
- **Environment examples**: Show dev vs prod configurations

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's logging fundamentals with simple, practical examples. 