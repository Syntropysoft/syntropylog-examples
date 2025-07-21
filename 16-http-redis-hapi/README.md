<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 16: HTTP + Redis with Hapi 🏰

> **Framework Integration** - Integrating SyntropyLog with Hapi for enterprise HTTP APIs with Redis caching and correlation.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog integration with Hapi:

- **Hapi plugins**: Custom plugins for logging and correlation
- **HTTP correlation**: Request tracing across Hapi applications
- **Redis caching**: Caching strategies in Hapi applications
- **Server methods**: SyntropyLog integration with Hapi server methods

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hapi + SyntropyLog Integration               │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Plugins     │ │ Routes      │ │ Server      │ │ Extensions  │ │
│ │             │ │             │ │ Methods     │ │             │ │
│ │ • Logging   │ │ • HTTP      │ │ • Business  │ │ • Request   │ │
│ │ • Correlation│ │   Endpoints │ │   Logic     │ │   Lifecycle │ │
│ │ • Error     │ │ • Validation│ │ • Data      │ │ • Response  │ │
│ │   Handling  │ │ • Caching   │ │   Access    │ │   Processing│ │
│ │ • Metrics   │ │ • Auth      │ │ • External  │ │ • Error     │ │
│ │ • Health    │ │ • Rate      │ │   APIs      │ │   Handling  │ │
│ │   Checks    │ │   Limiting  │ │ • Caching   │ │ • Logging   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Hapi Plugins:**
- **Logging plugin**: Request/response logging
- **Correlation plugin**: Correlation ID propagation
- **Error handling plugin**: Centralized error handling
- **Metrics plugin**: Performance metrics collection
- **Health check plugin**: System health monitoring

### **HTTP Correlation:**
- **Request tracing**: End-to-end request correlation
- **Plugin integration**: Correlation across plugins
- **External calls**: Correlation with third-party services
- **Error tracking**: Error correlation across requests
- **Performance monitoring**: Request performance tracking

### **Redis Caching:**
- **Cache plugin**: Hapi cache plugin with SyntropyLog
- **Cache strategies**: Different caching patterns
- **Cache invalidation**: Intelligent cache management
- **Cache monitoring**: Cache performance metrics
- **Cache fallbacks**: Graceful cache failure handling

### **Server Methods:**
- **Method integration**: SyntropyLog in server methods
- **Context propagation**: Request context in methods
- **Error handling**: Method error handling with logging
- **Performance tracking**: Method performance monitoring
- **Caching integration**: Method-level caching

## 🚀 Implementation Plan

### **Phase 1: Basic Hapi Setup**
- [ ] Hapi server setup
- [ ] SyntropyLog configuration
- [ ] Basic routes and handlers
- [ ] Logger integration

### **Phase 2: Plugin Implementation**
- [ ] Logging plugin
- [ ] Correlation plugin
- [ ] Error handling plugin
- [ ] Metrics plugin

### **Phase 3: Redis Integration**
- [ ] Redis client setup
- [ ] Cache plugin implementation
- [ ] Cache strategies demonstration
- [ ] Cache monitoring

### **Phase 4: Advanced Features**
- [ ] Custom plugins
- [ ] Server methods integration
- [ ] Extensions implementation
- [ ] Health checks

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Hapi application** with SyntropyLog integration
- ✅ **HTTP correlation** across Hapi plugins
- ✅ **Redis caching** with performance monitoring
- ✅ **Server methods** integration with SyntropyLog

### **Learning Outcomes:**
- ✅ **How to integrate SyntropyLog** with Hapi
- ✅ **HTTP correlation** in Hapi applications
- ✅ **Redis caching** strategies with monitoring
- ✅ **Hapi best practices** with observability

## 🔧 Prerequisites

- Node.js 18+
- Understanding of Hapi framework
- Familiarity with examples 10-13 (HTTP + Redis basics)

## 📝 Notes for Implementation

- **Start with basic Hapi**: Simple routes and handlers
- **Add plugins gradually**: Step-by-step plugin integration
- **Focus on server methods**: Hapi server methods with SyntropyLog
- **Include caching examples**: Real-world caching scenarios
- **Document plugin patterns**: Best practices for Hapi

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog integration with Hapi for building enterprise observable HTTP APIs with Redis caching. 