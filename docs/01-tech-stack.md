# Technology Stack

## Overview

This project is an open-source URL Shortener platform designed to provide secure, scalable, and efficient URL shortening services.

The objective is not only to build a working product but also to learn modern backend engineering, system design, database management, caching, security, DevOps, and collaborative software development.

---

# Architecture Overview

```text
React Frontend
       │
       ▼
Spring Boot Backend
       │
 ┌─────┴─────┐
 ▼           ▼
Redis     PostgreSQL
(Cache)   (Persistent Storage)
```

The frontend communicates with the backend through REST APIs.

The backend contains all business logic and interacts with both PostgreSQL and Redis.

Redis is used for fast access to frequently requested URLs, while PostgreSQL serves as the system of record.

---

# Frontend

## Technology

React

## Purpose

React is responsible for building the user interface of the application.

It allows users to:

* Create short URLs
* Manage previously created URLs
* View analytics
* Register and login
* Access dashboards

## Why React?

* Industry-standard frontend framework
* Component-based architecture
* Large ecosystem and community support
* Easy API integration
* Suitable for team-based development

## Alternatives Considered

* Angular
* Vue.js
* Plain HTML/CSS/JavaScript

React was selected due to its popularity, learning resources, and developer familiarity.

---

# Backend

## Technology

Spring Boot 3

Language: Java 21

## Purpose

Spring Boot is the core of the application.

It handles:

* REST API development
* Business logic
* Authentication and authorization
* URL generation
* Redirect handling
* Analytics processing
* Database communication

## Why Spring Boot?

* Enterprise-grade framework
* Strong architectural conventions
* Excellent support for large team development
* Dependency Injection support
* Large ecosystem
* Strong PostgreSQL and Redis integration

Spring Boot encourages clean architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

This separation makes the codebase easier to maintain and scale.

## Alternatives Considered

* Node.js + Express
* FastAPI
* Django

Spring Boot was chosen because the project aims to learn professional backend engineering practices commonly used in industry.

---

# Database

## Technology

PostgreSQL

## Purpose

PostgreSQL stores all persistent data.

Examples:

* Users
* Short URLs
* Click analytics
* URL metadata
* Expiration information

## Why PostgreSQL?

* Relational database
* ACID compliance
* Excellent indexing support
* Strong query capabilities
* Reliable transactions
* Widely used in production systems

The URL shortener contains highly structured relational data, making PostgreSQL a natural choice.

## Alternatives Considered

* MongoDB
* Supabase
* MySQL

PostgreSQL was chosen because of its maturity, analytics capabilities, and strong support within the Spring ecosystem.

---

# ORM Layer

## Technology

Spring Data JPA + Hibernate

## Purpose

Provides an abstraction layer between Java objects and database tables.

Example:

```java
User user = userRepository.findById(id);
```

instead of manually writing SQL for every operation.

## Why?

* Faster development
* Reduced boilerplate code
* Automatic mapping between objects and tables
* Built-in pagination and query support

---

# Cache

## Technology

Redis

## Purpose

Stores frequently accessed URL mappings.

Example:

```text
abc123
    ↓
https://example.com/very/long/url
```

When a user accesses a short URL, Redis can return the original URL immediately without querying PostgreSQL.

## Why Redis?

* Extremely fast in-memory storage
* Reduces database load
* Improves redirect performance
* Industry-standard caching solution

---

# Authentication & Security

## Technology

Spring Security + JWT

## Purpose

Provides secure access control.

Features:

* User registration
* User login
* Token generation
* Token validation
* Protected endpoints

## Why JWT?

* Stateless authentication
* Scalable architecture
* No server-side session storage required

## Why Spring Security?

* Industry standard for Java applications
* Deep integration with Spring Boot
* Flexible authorization mechanisms

---

# DevOps

## Technologies

Docker
Docker Compose
GitHub Actions

## Purpose

Provide reproducible environments and automated workflows.

### Docker

Used to containerize:

* Spring Boot application
* PostgreSQL
* Redis

Benefits:

* Consistent environments
* Easy onboarding
* Simplified deployment

### Docker Compose

Used to orchestrate multiple services during development.

Example:

```text
Spring Boot
PostgreSQL
Redis
```

can be started with a single command.

### GitHub Actions

Used for:

* Automated testing
* Build verification
* Continuous Integration (CI)

---

# Guiding Principles

The selected stack prioritizes:

1. Learning modern backend engineering
2. Industry relevance
3. Team maintainability
4. Scalability
5. Clean architecture
6. Strong documentation
7. Production readiness

The objective is not only to build a URL shortener but to understand how production-grade software systems are designed, developed, tested, and deployed.
