<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 09: HTTP Configuration 🌐

> **Core Framework Feature** - Understanding how to configure SyntropyLog's HTTP client instrumentation with multiple instances, adapters, and context propagation.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's HTTP configuration:

- **Multiple instances**: Configuring different HTTP clients for different APIs
- **Adapters**: Using different HTTP client libraries (Axios, Fetch, etc.)
- **Context propagation**: Automatically propagating correlation context
- **Logging configuration**: Controlling what gets logged for HTTP requests

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP Configuration                          │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Instances   │ │ Adapters    │ │ Context     │ │ Logging     │ │
│ │             │ │             │ │ Propagation │ │ Config      │ │
│ │             │ │             │ │             │ │             │ │
│ │ • userApi   │ │ • Axios     │ │ • Headers   │ │ • Success   │ │
│ │ • paymentApi│ │ • Fetch     │ │ • Correlation│ │ • Error     │ │
│ │ • externalApi│ • Custom    │ │ • Business  │ │ • Request   │ │
│ │ • default   │ │ • Multiple  │ │ • Custom    │ │ • Response  │ │
│ │ • named     │ │ • Conditional│ │ • Automatic │ │ • Headers   │ │
│ │ • aliased   │ │ • Environment│ │ • Manual    │ │ • Body      │ │
│ │ • grouped   │ │ • Specific  │ │ • Selective │ │ • Timing    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Multiple Instances:**
- **Instance naming**: Giving meaningful names to HTTP clients
- **Default instance**: Setting up a default HTTP client
- **Named instances**: Creating specific clients for different APIs
- **Instance management**: Organizing multiple HTTP clients

### **Adapters:**
- **Axios adapter**: Using Axios with SyntropyLog
- **Fetch adapter**: Using native Fetch with SyntropyLog
- **Custom adapters**: Creating your own HTTP client adapters
- **Adapter selection**: Choosing the right adapter for your needs

### **Context Propagation:**
- **Automatic propagation**: Correlation context propagated automatically
- **Custom headers**: Adding custom context to HTTP headers
- **Business context**: Propagating business-specific context
- **Selective propagation**: Choosing what context to propagate

### **Logging Configuration:**
- **Success logging**: Controlling what gets logged for successful requests
- **Error logging**: Configuring error logging for failed requests
- **Request logging**: Logging request details (headers, body)
- **Response logging**: Logging response details
- **Timing information**: Including request duration in logs

## 🚀 Implementation Plan

### **Phase 1: Basic HTTP Configuration**
- [ ] Single HTTP instance setup
- [ ] Basic adapter configuration
- [ ] Default instance configuration
- [ ] Simple context propagation

### **Phase 2: Multiple Instances**
- [ ] Multiple HTTP instances
- [ ] Named instance configuration
- [ ] Instance-specific settings
- [ ] Default instance selection

### **Phase 3: Advanced Configuration**
- [ ] Custom adapters
- [ ] Advanced context propagation
- [ ] Conditional logging
- [ ] Performance optimization

### **Phase 4: Real-World Patterns**
- [ ] API gateway patterns
- [ ] Microservice patterns
- [ ] External API patterns
- [ ] Production patterns

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Multiple HTTP instances** configured correctly
- ✅ **Different adapters** working together
- ✅ **Context propagation** working automatically
- ✅ **Logging configuration** properly set up

### **Learning Outcomes:**
- ✅ **How to configure HTTP** for different APIs
- ✅ **Adapter selection** strategies
- ✅ **Context propagation** patterns
- ✅ **HTTP logging** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of HTTP client concepts
- Familiarity with examples 00-08 (basic setup through logging matrix)

## 📝 Notes for Implementation

- **Start simple**: Single HTTP instance first
- **Add complexity gradually**: One instance at a time
- **Focus on practical use**: Show real API scenarios
- **Document patterns**: Explain when to use what
- **Real-world examples**: Show practical use cases

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's HTTP configuration with simple, practical examples. 