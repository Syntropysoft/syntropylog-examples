<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 14: HTTP + Redis with NestJS 🪺

> **Framework Integration** - Integrating SyntropyLog with NestJS for HTTP APIs with Redis caching and correlation.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog integration with NestJS:

- **NestJS integration**: Decorators, interceptors, and providers
- **HTTP correlation**: Request tracing across NestJS services
- **Redis caching**: Caching strategies in NestJS applications
- **Dependency injection**: SyntropyLog services in NestJS DI container

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS + SyntropyLog Integration             │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Controllers │ │ Services    │ │ Interceptors│ │ Providers   │ │
│ │             │ │             │ │             │ │             │ │
│ │ • HTTP      │ │ • Business  │ │ • Request   │ │ • Logger    │ │
│ │   Endpoints │ │   Logic     │ │   Logging   │ │ • Redis     │ │
│ │ • Validation│ │ • Data      │ │ • Response  │ │ • HTTP      │ │
│ │ • DTOs      │ │   Access    │ │   Logging   │ │   Client    │ │
│ │ • Guards    │ │ • Caching   │ │ • Error     │ │ • Context   │ │
│ │ • Filters   │ │ • External  │ │   Handling  │ │ • Metrics   │ │
│ │ • Pipes     │ │   APIs      │ │ • Metrics   │ │ • Health    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **NestJS Integration:**
- **Decorators**: Custom decorators for logging and correlation
- **Interceptors**: Request/response logging interceptors
- **Providers**: SyntropyLog services as NestJS providers
- **Modules**: Modular SyntropyLog configuration
- **Guards**: Authentication and authorization with logging

### **HTTP Correlation:**
- **Request tracing**: End-to-end request correlation
- **Service calls**: Correlation across multiple services
- **External APIs**: Correlation with third-party services
- **Error tracking**: Error correlation across services
- **Performance monitoring**: Request performance tracking

### **Redis Caching:**
- **Cache decorators**: NestJS cache decorators with SyntropyLog
- **Cache strategies**: Different caching patterns
- **Cache invalidation**: Intelligent cache management
- **Cache monitoring**: Cache performance metrics
- **Cache fallbacks**: Graceful cache failure handling

### **Dependency Injection:**
- **Logger injection**: SyntropyLog logger in services
- **Redis injection**: Redis client injection
- **HTTP client injection**: Instrumented HTTP client
- **Context injection**: Request context injection
- **Metrics injection**: Performance metrics injection

## 🚀 Implementation Plan

### **Phase 1: Basic NestJS Setup**
- [ ] NestJS application setup
- [ ] SyntropyLog module configuration
- [ ] Basic controller and service
- [ ] Logger injection

### **Phase 2: HTTP Correlation**
- [ ] Request interceptor implementation
- [ ] Response interceptor implementation
- [ ] Correlation ID propagation
- [ ] Error handling interceptor

### **Phase 3: Redis Integration**
- [ ] Redis provider setup
- [ ] Cache decorators implementation
- [ ] Cache strategies demonstration
- [ ] Cache monitoring

### **Phase 4: Advanced Features**
- [ ] Custom decorators
- [ ] Guards with logging
- [ ] Filters with correlation
- [ ] Health checks

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **NestJS application** with SyntropyLog integration
- ✅ **HTTP correlation** across NestJS services
- ✅ **Redis caching** with performance monitoring
- ✅ **Dependency injection** of SyntropyLog services

### **Learning Outcomes:**
- ✅ **How to integrate SyntropyLog** with NestJS
- ✅ **HTTP correlation** in NestJS applications
- ✅ **Redis caching** strategies with monitoring
- ✅ **NestJS best practices** with observability

## 🔧 Prerequisites

- Node.js 18+
- Understanding of NestJS framework
- Familiarity with examples 10-13 (HTTP + Redis basics)

## 📝 Notes for Implementation

- **Start with basic NestJS**: Simple controller and service
- **Add SyntropyLog gradually**: Step-by-step integration
- **Focus on correlation**: Request tracing across services
- **Include caching examples**: Real-world caching scenarios
- **Document integration patterns**: Best practices for NestJS

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog integration with NestJS for building observable HTTP APIs with Redis caching. 