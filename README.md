# 🍔 FoodRush — Food Delivery Platform

> **Event-Driven Microservices Architecture** | Java 21 + Spring Boot 3.x + Kafka + Redis + MySQL + React

A full-featured food delivery platform that handles the complete lifecycle — restaurant browsing, order placement, real-time delivery tracking, and payment settlement — built using a production-grade microservices architecture.

---

## ✨ Highlights

| Feature | Description | How |
|---|---|---|
| 🤖 **AI Smart Order Prediction** | Learns user patterns (day, time, past orders) and suggests meals proactively | Google Gemini API + Kafka + Redis |
| 👥 **Group Order with Live Split** | Create a shared order link; friends join, add items independently; bill auto-splits | WebSocket/STOMP + Redis |
| ⚡ **Dynamic Surge Pricing Engine** | Delivery fees adjust in real-time based on zone demand vs driver availability | Redis counters + Kafka + recalculates every 30s |

---

## 🏗️ Architecture Overview

FoodRush follows a strict **event-driven pipeline**. Every core service communicates asynchronously via **Apache Kafka** — no direct REST calls between services. Redis handles all real-time state. WebSocket/STOMP pushes live updates to clients.

```
Client (Web / Mobile)
       ↓
API Gateway :8080  ←  Redis Rate Limiter
       │ JWT Auth + Route
       ↓
┌──────────────────────────────────┐
│  User Service      :8081         │  Registration, Login, Address
│  Restaurant Service :8082        │  Menu, Search, Ratings
│  Order Service     :8083  ───────┼──→ Kafka [order-placed]
│  Delivery Service  :8084  ←──────┼── Kafka [order-placed]
│                           ───────┼──→ WebSocket (live GPS every 3s)
│  Payment Service   :8085  ←──────┼── Kafka [delivery-completed]
│  Notification Svc  :8086  ←──────┼── Kafka [order-*, payment-*, delivery-*]
└──────────────────────────────────┘
       │
Config Server :8888  |  Discovery Server (Eureka) :8761
```

### Key Design Patterns
- **Database-per-Service** — each microservice owns its MySQL schema
- **SAGA Pattern** — distributed payment transactions (lock → process → settle)
- **CQRS / Eventual Consistency** — async Kafka events, no two-phase commits
- **Optimistic Locking** — wallet balance updates in Payment Service
- **Redis Cache** — sessions, cart, driver locations, surge pricing, AI predictions

---

## 🧩 Services

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 8080 | JWT auth, routing, Redis rate-limiting |
| `user-service` | 8081 | Registration, login, profiles, addresses |
| `restaurant-service` | 8082 | Menu management, search, ratings, Redis cache |
| `order-service` | 8083 | Cart (Redis), checkout, order lifecycle, AI predictions |
| `delivery-service` | 8084 | Driver matching, WebSocket live tracking |
| `payment-service` | 8085 | Wallet, transactions, refunds (SAGA) |
| `notification-service` | 8086 | Email notifications via Gmail SMTP |
| `config-server` | 8888 | Centralized configuration (Spring Cloud Config) |
| `discovery-server` | 8761 | Service registry (Eureka) |

---

## 📨 Kafka Topics

| Topic | Producer | Consumer(s) | Partitions |
|---|---|---|---|
| `order-placed` | Order Service | Delivery, Notification | 12 |
| `order-accepted` | Restaurant | Order, Notification | 6 |
| `order-cancelled` | User/System | Payment, Delivery, Notification | 6 |
| `driver-assigned` | Delivery | Order, Notification | 12 |
| `delivery-picked-up` | Delivery | Order, Notification | 12 |
| `delivery-completed` | Delivery | Payment, Order, Notification | 12 |
| `payment-completed` | Payment | Order, Notification | 6 |
| `payment-failed` | Payment | Order, Notification | 3 |
| `driver-location` | Driver App | Delivery Service | 24 |
| `surge-pricing-update` | Pricing Engine | Order, Restaurant | 6 |
| `group-order-update` | Order Service | WebSocket Broadcaster | 6 |
| `dlq-failed-events` | All Services | Alert/Monitor | 3 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21, Spring Boot 3.x |
| **API Gateway** | Spring Cloud Gateway (reactive, non-blocking) |
| **Security** | Spring Security + JWT (stateless) |
| **Messaging** | Apache Kafka + Zookeeper |
| **Cache / Real-Time State** | Redis |
| **Database** | MySQL (database-per-service) |
| **Real-Time** | WebSocket + STOMP |
| **Service Discovery** | Netflix Eureka |
| **Config Management** | Spring Cloud Config Server |
| **AI** | Google Gemini API |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Zustand, React Router |
| **Containerization** | Docker Compose |
| **CI/CD** | GitHub Actions |
| **Deployment** | Oracle Cloud VM |

---

## 📁 Project Structure

```
foodRush/
├── Backened/
│   ├── api-gateway/
│   ├── config-server/
│   ├── discovery-server/
│   ├── user-service/
│   ├── restaurant-service/
│   ├── order-service/
│   ├── delivery-service/
│   ├── payment-service/
│   └── notification-service/
├── frontend/               # React + Vite + Tailwind
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── store/          # Zustand state management
├── docker-compose.yml      # Kafka, Zookeeper, Kafka UI
├── phase2-seed.sql         # DB seed data
└── .env.example
```

---

## ⚙️ Prerequisites

- **Java 21**
- **Node.js 18+** & npm
- **Docker & Docker Compose**
- **MySQL** (or use Docker)
- **Redis** (or use Docker)
- A **Google Gemini API key** (for AI order predictions)
- A **Gmail account** with App Password enabled (for email notifications)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/foodRush.git
cd foodRush
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database
DB_USERNAME=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP=localhost:9092

# JWT (must be at least 64 characters)
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION=86400000

# Service URLs
EUREKA_URL=http://localhost:8761/eureka/
CONFIG_SERVER_URL=http://localhost:8888

# Email (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

### 3. Start infrastructure (Kafka, Zookeeper)

```bash
docker-compose up -d
```

This starts:
- **Zookeeper** on port `2181`
- **Kafka** on port `9092`
- **Kafka UI** on port `8090` (http://localhost:8090)

### 4. Start backend services (in order)

Start each service from its directory using Gradle:

```bash
# 1. Config Server (must start first)
cd Backened/config-server && ./gradlew bootRun

# 2. Discovery Server
cd Backened/discovery-server && ./gradlew bootRun

# 3. Core services (can be started in parallel)
cd Backened/user-service        && ./gradlew bootRun
cd Backened/restaurant-service  && ./gradlew bootRun
cd Backened/order-service       && ./gradlew bootRun
cd Backened/delivery-service    && ./gradlew bootRun
cd Backened/payment-service     && ./gradlew bootRun
cd Backened/notification-service && ./gradlew bootRun

# 4. API Gateway (last)
cd Backened/api-gateway && ./gradlew bootRun
```

### 5. Seed the database (optional)

```bash
mysql -u root -p < phase2-seed.sql
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📊 Service Ports Reference

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Config Server | http://localhost:8888 |
| User Service | http://localhost:8081 |
| Restaurant Service | http://localhost:8082 |
| Order Service | http://localhost:8083 |
| Delivery Service | http://localhost:8084 |
| Payment Service | http://localhost:8085 |
| Notification Service | http://localhost:8086 |
| Kafka UI | http://localhost:8090 |

---

## 📐 Non-Functional Targets

| Requirement | Target |
|---|---|
| Order Throughput | 5,000 orders/minute at peak |
| API Latency | < 200ms (p95) |
| Driver Location Updates | Every 3 seconds via WebSocket |
| Consistency Model | Eventual Consistency (SAGA for payments) |
| Availability | 99.9% uptime |
| Scalability | Independent horizontal scaling per service |

---

## 🔒 Security

- All routes are protected via **JWT authentication** enforced at the API Gateway.
- Tokens are validated before any request reaches a downstream service.
- The `.env` file is **never committed to Git** — use `.env.example` as the template.

---

## 🗺️ Future Enhancements

- SMS/Push notification support
- Multi-restaurant cart
- Scheduled/pre-planned orders
- Admin analytics dashboard
- Kubernetes deployment manifests
- Rate limiting per user (currently per IP)

---

## 📄 Design Documentation

See [`FoodDeliveryPlatform_HLD_LLD.docx`](./FoodDeliveryPlatform_HLD_LLD.docx) for the full High-Level Design and Low-Level Design document, including:
- Database schemas for all services
- Order state machine diagram
- Driver matching algorithm
- Payment SAGA flow
- API contracts

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

## 📝 License

This project is for educational and portfolio purposes.
