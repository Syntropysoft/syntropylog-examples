<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 15: HTTP + Redis with Koa 🌊

> **Framework Integration** - Integrating SyntropyLog with Koa for lightweight HTTP APIs with Redis caching and correlation.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog integration with Koa:

- **Koa middleware**: Custom middleware for logging and correlation
- **HTTP correlation**: Request tracing across Koa applications
- **Redis caching**: Caching strategies in Koa applications
- **Context propagation**: SyntropyLog context in Koa ctx

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Koa + SyntropyLog Integration                │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Middleware  │ │ Routes      │ │ Services    │ │ Context     │ │
│ │             │ │             │ │             │ │             │ │
│ │ • Logging   │ │ • HTTP      │ │ • Business  │ │ • Request   │ │
│ │ • Correlation│ │   Endpoints │ │   Logic     │ │   Context   │ │
│ │ • Error     │ │ • Validation│ │ • Data      │ │ • Correlation│ │
│ │   Handling  │ │ • Caching   │ │   Access    │ │ • State     │ │
│ │ • Metrics   │ │ • Auth      │ │ • External  │ │ • Headers   │ │
│ │ • Health    │ │ • Rate      │ │   APIs      │ │ • Params    │ │
│ │   Checks    │ │   Limiting  │ │ • Caching   │ │ • Body      │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Koa Middleware:**
- **Logging middleware**: Request/response logging
- **Correlation middleware**: Correlation ID propagation
- **Error handling middleware**: Centralized error handling
- **Metrics middleware**: Performance metrics collection
- **Health check middleware**: System health monitoring

### **HTTP Correlation:**
- **Request tracing**: End-to-end request correlation
- **Context propagation**: Correlation across middleware
- **External calls**: Correlation with third-party services
- **Error tracking**: Error correlation across requests
- **Performance monitoring**: Request performance tracking

### **Redis Caching:**
- **Cache middleware**: Koa cache middleware with SyntropyLog
- **Cache strategies**: Different caching patterns
- **Cache invalidation**: Intelligent cache management
- **Cache monitoring**: Cache performance metrics
- **Cache fallbacks**: Graceful cache failure handling

### **Context Integration:**
- **Context injection**: SyntropyLog context in Koa ctx
- **State management**: Request state with correlation
- **Header propagation**: Correlation headers
- **Parameter logging**: Request parameters logging
- **Body logging**: Request/response body logging

## 🚀 Implementation Plan

### **Phase 1: Basic Koa Setup**
- [ ] Koa application setup
- [ ] SyntropyLog configuration
- [ ] Basic routes and handlers
- [ ] Logger integration

### **Phase 2: Middleware Implementation**
- [ ] Logging middleware
- [ ] Correlation middleware
- [ ] Error handling middleware
- [ ] Metrics middleware

### **Phase 3: Redis Integration**
- [ ] Redis client setup
- [ ] Cache middleware implementation
- [ ] Cache strategies demonstration
- [ ] Cache monitoring

### **Phase 4: Advanced Features**
- [ ] Custom middleware
- [ ] Route-specific logging
- [ ] Performance optimization
- [ ] Health checks

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Koa application** with SyntropyLog integration
- ✅ **HTTP correlation** across Koa middleware
- ✅ **Redis caching** with performance monitoring
- ✅ **Context integration** with SyntropyLog

### **Learning Outcomes:**
- ✅ **How to integrate SyntropyLog** with Koa
- ✅ **HTTP correlation** in Koa applications
- ✅ **Redis caching** strategies with monitoring
- ✅ **Koa best practices** with observability

## 🔧 Prerequisites

- Node.js 18+
- Understanding of Koa framework
- Familiarity with examples 10-13 (HTTP + Redis basics)

## 📝 Notes for Implementation

- **Start with basic Koa**: Simple routes and handlers
- **Add middleware gradually**: Step-by-step middleware integration
- **Focus on context**: Koa ctx integration with SyntropyLog
- **Include caching examples**: Real-world caching scenarios
- **Document middleware patterns**: Best practices for Koa

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog integration with Koa for building lightweight observable HTTP APIs with Redis caching. 