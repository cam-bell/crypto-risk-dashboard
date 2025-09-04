# Crypto Risk Dashboard - Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Next.js Frontend]
        PWA[PWA Features]
        WS_CLIENT[WebSocket Client]
        RQ[React Query Cache]
    end

    subgraph "Backend Layer"
        API[FastAPI Server]
        AUTH[JWT Authentication]
        WS_SERVER[WebSocket Server]
    end

    subgraph "Core Services"
        PORT_SVC[Portfolio Service]
        RISK_SVC[Risk Analysis Service]
        AI_SVC[AI Service]
        MARKET_SVC[Market Data Service]
        ALERT_SVC[Alert Service]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL + TimescaleDB)]
        REDIS[(Redis Cache)]
        CELERY[Celery Workers]
    end

    subgraph "External APIs"
        CG[CoinGecko API]
        ES[Etherscan API]
        AV[Alpha Vantage API]
    end

    subgraph "AI/ML Layer"
        LANGCHAIN[LangChain]
        OPENAI[OpenAI API]
        RISK_ENGINE[Risk Calculation Engine]
    end

    FE --> API
    FE --> WS_SERVER
    WS_CLIENT --> WS_SERVER
    RQ --> API

    API --> PORT_SVC
    API --> RISK_SVC
    API --> AI_SVC
    API --> MARKET_SVC
    API --> ALERT_SVC

    PORT_SVC --> DB
    RISK_SVC --> DB
    AI_SVC --> DB
    MARKET_SVC --> REDIS
    ALERT_SVC --> DB

    CELERY --> CG
    CELERY --> ES
    CELERY --> AV
    CELERY --> DB
    CELERY --> REDIS

    AI_SVC --> LANGCHAIN
    LANGCHAIN --> OPENAI
    RISK_SVC --> RISK_ENGINE

    WS_SERVER --> FE
    REDIS --> API
```

## 2. Data Flow Pipeline

```mermaid
sequenceDiagram
    participant ExtAPI as External APIs
    participant BG as Background Tasks
    participant Cache as Redis Cache
    participant DB as Database
    participant WS as WebSocket Server
    participant FE as Frontend

    Note over ExtAPI,FE: Real-Time Data Flow

    loop Every 5-60 minutes
        BG->>ExtAPI: Fetch crypto prices
        ExtAPI-->>BG: Price data
        BG->>Cache: Store with TTL
        BG->>DB: Store time-series data
        BG->>WS: Push updates
        WS->>FE: Real-time price updates
    end

    Note over ExtAPI,FE: User Interaction Flow

    FE->>WS: User action
    WS->>DB: Update portfolio
    DB-->>WS: Confirmation
    WS->>BG: Trigger background task
    BG->>DB: Process risk calculations
    BG->>WS: Push risk updates
    WS->>FE: Real-time update
```

## 3. Database Schema (Entity Relationship)

```mermaid
erDiagram
    USERS {
        varchar id PK
        varchar email UK
        varchar username UK
        varchar hashed_password
        varchar full_name
        boolean is_active
        timestamp created_at
    }

    CRYPTO_ASSETS {
        varchar id PK
        varchar symbol UK
        varchar name
        varchar coingecko_id UK
        varchar contract_address
        varchar blockchain
        float current_price_usd
        float price_change_24h
        boolean is_active
    }

    PORTFOLIOS {
        varchar id PK
        varchar user_id FK
        varchar name
        text description
        float total_value_usd
        float risk_score
        timestamp created_at
    }

    PORTFOLIO_HOLDINGS {
        varchar id PK
        varchar portfolio_id FK
        varchar crypto_asset_id FK
        float quantity
        float average_buy_price_usd
        float current_value_usd
        float profit_loss_usd
    }

    PRICE_HISTORY {
        varchar id PK
        varchar crypto_asset_id FK
        timestamp timestamp
        float price_usd
        float volume_24h
        float market_cap
    }

    RISK_METRICS {
        varchar id PK
        varchar crypto_asset_id FK
        varchar portfolio_id FK
        timestamp timestamp
        float volatility
        float var_95
        float sharpe_ratio
        float max_drawdown
    }

    AI_INSIGHTS {
        varchar id PK
        varchar user_id FK
        varchar portfolio_id FK
        varchar insight_type
        varchar title
        text summary
        float confidence_score
        timestamp created_at
    }

    ALERTS {
        varchar id PK
        varchar user_id FK
        varchar portfolio_id FK
        varchar alert_type
        varchar title
        text message
        varchar severity
        boolean is_active
        timestamp created_at
    }

    USERS ||--o{ PORTFOLIOS : owns
    PORTFOLIOS ||--o{ PORTFOLIO_HOLDINGS : contains
    CRYPTO_ASSETS ||--o{ PORTFOLIO_HOLDINGS : held_in
    CRYPTO_ASSETS ||--o{ PRICE_HISTORY : has_history
    CRYPTO_ASSETS ||--o{ RISK_METRICS : has_risk
    PORTFOLIOS ||--o{ RISK_METRICS : has_risk
    USERS ||--o{ AI_INSIGHTS : receives
    PORTFOLIOS ||--o{ AI_INSIGHTS : analyzed
    USERS ||--o{ ALERTS : receives
    PORTFOLIOS ||--o{ ALERTS : monitored
```

## 4. Real-Time Data Flow

```mermaid
graph LR
    subgraph "Data Sources"
        CG[CoinGecko API]
        ES[Etherscan API]
        AV[Alpha Vantage API]
    end

    subgraph "Background Processing"
        CELERY[Celery Workers]
        QUEUE[Task Queues]
    end

    subgraph "Storage Layer"
        REDIS[(Redis Cache)]
        DB[(TimescaleDB)]
    end

    subgraph "Real-Time Layer"
        WS[WebSocket Server]
        CHANNELS[WebSocket Channels]
    end

    subgraph "Frontend"
        WS_CLIENT[WebSocket Client]
        RQ[React Query]
        UI[UI Components]
    end

    CG --> CELERY
    ES --> CELERY
    AV --> CELERY

    CELERY --> QUEUE
    QUEUE --> REDIS
    QUEUE --> DB

    DB --> WS
    REDIS --> WS

    WS --> CHANNELS
    CHANNELS --> WS_CLIENT

    WS_CLIENT --> RQ
    RQ --> UI

    CHANNELS -.->|price_updates| WS_CLIENT
    CHANNELS -.->|portfolio_updates| WS_CLIENT
    CHANNELS -.->|risk_metrics_updates| WS_CLIENT
    CHANNELS -.->|alerts| WS_CLIENT
```

## 5. Background Task System

```mermaid
graph TB
    subgraph "Celery Beat Scheduler"
        BEAT[Celery Beat]
    end

    subgraph "Task Queues"
        CRYPTO_Q[crypto_data queue]
        MARKET_Q[market_data queue]
        BLOCKCHAIN_Q[blockchain_data queue]
        MAINT_Q[maintenance queue]
        MONITOR_Q[monitoring queue]
    end

    subgraph "Background Tasks"
        FETCH_PRICES[fetch-crypto-prices<br/>Every 5 minutes]
        FETCH_MARKET[fetch-market-data<br/>Every 10 minutes]
        FETCH_WALLET[fetch-wallet-analysis<br/>Every hour]
        CLEANUP[cleanup-cache<br/>Daily at 2 AM]
        HEALTH[health-check-apis<br/>Every 5 minutes]
    end

    subgraph "External APIs"
        CG[CoinGecko]
        ES[Etherscan]
        AV[Alpha Vantage]
    end

    subgraph "Storage"
        REDIS[(Redis)]
        DB[(Database)]
    end

    BEAT --> FETCH_PRICES
    BEAT --> FETCH_MARKET
    BEAT --> FETCH_WALLET
    BEAT --> CLEANUP
    BEAT --> HEALTH

    FETCH_PRICES --> CRYPTO_Q
    FETCH_MARKET --> MARKET_Q
    FETCH_WALLET --> BLOCKCHAIN_Q
    CLEANUP --> MAINT_Q
    HEALTH --> MONITOR_Q

    CRYPTO_Q --> CG
    MARKET_Q --> CG
    BLOCKCHAIN_Q --> ES
    MARKET_Q --> AV

    FETCH_PRICES --> REDIS
    FETCH_PRICES --> DB
    FETCH_MARKET --> REDIS
    FETCH_MARKET --> DB
    FETCH_WALLET --> DB
    CLEANUP --> REDIS
    HEALTH --> CG
    HEALTH --> ES
    HEALTH --> AV
```

## 6. Risk Calculation Engine

```mermaid
flowchart TD
    subgraph "Input Data"
        PORTFOLIO[Portfolio Data]
        PRICES[Price History]
        HOLDINGS[Portfolio Holdings]
    end

    subgraph "Risk Engine Core"
        RETURNS[Calculate Returns]
        VOLATILITY[Volatility Calculation]
        VAR[Value at Risk]
        DRAWDOWN[Maximum Drawdown]
        SHARPE[Sharpe Ratio]
        BETA[Beta Calculation]
        CORRELATION[Correlation Matrix]
        HHI[Herfindahl Index]
    end

    subgraph "Risk Metrics"
        RISK_SCORE[Risk Score 1-10]
        RISK_LEVEL[Risk Level Classification]
        TREND[Risk Trend Analysis]
    end

    subgraph "Output"
        METRICS[Risk Metrics]
        ALERTS[Risk Alerts]
        VISUALIZATION[Risk Visualization]
    end

    PORTFOLIO --> RETURNS
    PRICES --> RETURNS
    HOLDINGS --> RETURNS

    RETURNS --> VOLATILITY
    RETURNS --> VAR
    RETURNS --> DRAWDOWN
    RETURNS --> SHARPE
    RETURNS --> BETA
    RETURNS --> CORRELATION
    HOLDINGS --> HHI

    VOLATILITY --> RISK_SCORE
    VAR --> RISK_SCORE
    DRAWDOWN --> RISK_SCORE
    SHARPE --> RISK_SCORE
    BETA --> RISK_SCORE
    CORRELATION --> RISK_SCORE
    HHI --> RISK_SCORE

    RISK_SCORE --> RISK_LEVEL
    RISK_SCORE --> TREND

    RISK_LEVEL --> METRICS
    TREND --> METRICS
    METRICS --> ALERTS
    METRICS --> VISUALIZATION
```

## 7. AI Insights Pipeline

```mermaid
flowchart LR
    subgraph "Data Input"
        PORT_DATA[Portfolio Data]
        MARKET_DATA[Market Data]
        RISK_DATA[Risk Metrics]
        USER_PREFS[User Preferences]
    end

    subgraph "AI Processing"
        LANGCHAIN[LangChain Framework]
        PROMPTS[AI Prompts]
        CONTEXT[Context Builder]
    end

    subgraph "External AI"
        OPENAI[OpenAI API]
        MODELS[GPT Models]
    end

    subgraph "AI Tasks"
        WEEKLY[Weekly Analysis]
        REBALANCE[Rebalancing Suggestions]
        SENTIMENT[Market Sentiment]
        ALERTS[Risk Alerts]
    end

    subgraph "Output"
        INSIGHTS[AI Insights]
        RECOMMENDATIONS[Recommendations]
        NOTIFICATIONS[Notifications]
    end

    PORT_DATA --> CONTEXT
    MARKET_DATA --> CONTEXT
    RISK_DATA --> CONTEXT
    USER_PREFS --> CONTEXT

    CONTEXT --> LANGCHAIN
    LANGCHAIN --> PROMPTS
    PROMPTS --> OPENAI
    OPENAI --> MODELS

    MODELS --> WEEKLY
    MODELS --> REBALANCE
    MODELS --> SENTIMENT
    MODELS --> ALERTS

    WEEKLY --> INSIGHTS
    REBALANCE --> RECOMMENDATIONS
    SENTIMENT --> INSIGHTS
    ALERTS --> NOTIFICATIONS

    INSIGHTS --> PORT_DATA
    RECOMMENDATIONS --> PORT_DATA
```

## 8. Frontend Component Architecture

```mermaid
graph TB
    subgraph "App Layer"
        APP[App Component]
        LAYOUT[Layout Component]
        PROVIDERS[Providers]
    end

    subgraph "Pages"
        DASHBOARD[Dashboard Page]
        PORTFOLIOS[Portfolios Page]
        RISK[Risk Analysis Page]
        INSIGHTS[AI Insights Page]
        MARKETS[Markets Page]
        ALERTS[Alerts Page]
    end

    subgraph "Components"
        DASH_OVERVIEW[Dashboard Overview]
        PORT_LIST[Portfolio List]
        PORT_DETAIL[Portfolio Detail]
        RISK_METRICS[Risk Metrics]
        RISK_HEATMAP[Risk Heatmap]
        AI_INSIGHTS[AI Insights]
        MARKET_OVERVIEW[Market Overview]
        ALERT_CENTER[Alert Center]
    end

    subgraph "Hooks"
        USE_PORTFOLIO[usePortfolio]
        USE_RISK[useRiskMetrics]
        USE_AI[useAIInsights]
        USE_REALTIME[useRealTimeData]
        USE_CRYPTO[useCryptoAssets]
    end

    subgraph "State Management"
        RQ[React Query]
        WS[WebSocket Client]
        CACHE[Client Cache]
    end

    APP --> LAYOUT
    LAYOUT --> PROVIDERS
    PROVIDERS --> DASHBOARD
    PROVIDERS --> PORTFOLIOS
    PROVIDERS --> RISK
    PROVIDERS --> INSIGHTS
    PROVIDERS --> MARKETS
    PROVIDERS --> ALERTS

    DASHBOARD --> DASH_OVERVIEW
    PORTFOLIOS --> PORT_LIST
    PORTFOLIOS --> PORT_DETAIL
    RISK --> RISK_METRICS
    RISK --> RISK_HEATMAP
    INSIGHTS --> AI_INSIGHTS
    MARKETS --> MARKET_OVERVIEW
    ALERTS --> ALERT_CENTER

    DASH_OVERVIEW --> USE_PORTFOLIO
    PORT_LIST --> USE_PORTFOLIO
    PORT_DETAIL --> USE_PORTFOLIO
    RISK_METRICS --> USE_RISK
    RISK_HEATMAP --> USE_RISK
    AI_INSIGHTS --> USE_AI
    MARKET_OVERVIEW --> USE_CRYPTO
    ALERT_CENTER --> USE_REALTIME

    USE_PORTFOLIO --> RQ
    USE_RISK --> RQ
    USE_AI --> RQ
    USE_REALTIME --> WS
    USE_CRYPTO --> RQ

    RQ --> CACHE
    WS --> CACHE
```

## 9. API Integration Layer

```mermaid
graph TB
    subgraph "External APIs"
        CG[CoinGecko API]
        ES[Etherscan API]
        AV[Alpha Vantage API]
    end

    subgraph "API Clients"
        CG_CLIENT[CoinGecko Client]
        ES_CLIENT[Etherscan Client]
        AV_CLIENT[Alpha Vantage Client]
        BASE_CLIENT[Base Client]
    end

    subgraph "Integration Service"
        INT_SVC[Integration Service]
        RATE_LIMIT[Rate Limiting]
        RETRY[Retry Logic]
        CIRCUIT[Circuit Breaker]
    end

    subgraph "Caching Layer"
        REDIS[(Redis Cache)]
        TTL[TTL Management]
        INVALIDATION[Cache Invalidation]
    end

    subgraph "Background Tasks"
        CELERY[Celery Workers]
        SCHEDULER[Task Scheduler]
    end

    CG --> CG_CLIENT
    ES --> ES_CLIENT
    AV --> AV_CLIENT

    CG_CLIENT --> BASE_CLIENT
    ES_CLIENT --> BASE_CLIENT
    AV_CLIENT --> BASE_CLIENT

    BASE_CLIENT --> RATE_LIMIT
    BASE_CLIENT --> RETRY
    BASE_CLIENT --> CIRCUIT

    RATE_LIMIT --> INT_SVC
    RETRY --> INT_SVC
    CIRCUIT --> INT_SVC

    INT_SVC --> REDIS
    REDIS --> TTL
    REDIS --> INVALIDATION

    INT_SVC --> CELERY
    CELERY --> SCHEDULER

    SCHEDULER --> CG_CLIENT
    SCHEDULER --> ES_CLIENT
    SCHEDULER --> AV_CLIENT
```

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Load Balancer]
    end

    subgraph "Frontend Tier"
        FE1[Next.js Instance 1]
        FE2[Next.js Instance 2]
        FE3[Next.js Instance 3]
        CDN[CDN]
    end

    subgraph "Backend Tier"
        API1[FastAPI Instance 1]
        API2[FastAPI Instance 2]
        API3[FastAPI Instance 3]
    end

    subgraph "WebSocket Tier"
        WS1[WebSocket Server 1]
        WS2[WebSocket Server 2]
    end

    subgraph "Background Processing"
        WORKER1[Celery Worker 1]
        WORKER2[Celery Worker 2]
        WORKER3[Celery Worker 3]
        BEAT[Celery Beat]
    end

    subgraph "Data Tier"
        DB_MASTER[(PostgreSQL Master)]
        DB_REPLICA1[(PostgreSQL Replica 1)]
        DB_REPLICA2[(PostgreSQL Replica 2)]
        REDIS_CLUSTER[(Redis Cluster)]
    end

    subgraph "External Services"
        CG[CoinGecko API]
        ES[Etherscan API]
        AV[Alpha Vantage API]
        OPENAI[OpenAI API]
    end

    LB --> FE1
    LB --> FE2
    LB --> FE3
    CDN --> FE1
    CDN --> FE2
    CDN --> FE3

    FE1 --> API1
    FE2 --> API2
    FE3 --> API3

    API1 --> WS1
    API2 --> WS2
    API3 --> WS1

    API1 --> DB_MASTER
    API2 --> DB_REPLICA1
    API3 --> DB_REPLICA2

    API1 --> REDIS_CLUSTER
    API2 --> REDIS_CLUSTER
    API3 --> REDIS_CLUSTER

    WORKER1 --> CG
    WORKER2 --> ES
    WORKER3 --> AV
    BEAT --> WORKER1
    BEAT --> WORKER2
    BEAT --> WORKER3

    WORKER1 --> DB_MASTER
    WORKER2 --> DB_MASTER
    WORKER3 --> DB_MASTER

    WORKER1 --> REDIS_CLUSTER
    WORKER2 --> REDIS_CLUSTER
    WORKER3 --> REDIS_CLUSTER

    API1 --> OPENAI
    API2 --> OPENAI
    API3 --> OPENAI
```

## Performance Metrics & Monitoring

```mermaid
graph LR
    subgraph "Application Metrics"
        API_RESPONSE[API Response Times]
        DB_QUERIES[Database Query Performance]
        CACHE_HIT[Cache Hit Rates]
        WS_CONNECTIONS[WebSocket Connections]
    end

    subgraph "Business Metrics"
        USER_ACTIVE[Active Users]
        PORTFOLIOS[Portfolio Count]
        RISK_CALC[Risk Calculations]
        AI_INSIGHTS[AI Insights Generated]
    end

    subgraph "Infrastructure Metrics"
        CPU[CPU Usage]
        MEMORY[Memory Usage]
        DISK[Disk I/O]
        NETWORK[Network Traffic]
    end

    subgraph "External Dependencies"
        API_HEALTH[External API Health]
        RATE_LIMITS[Rate Limit Usage]
        ERROR_RATES[Error Rates]
    end

    subgraph "Monitoring Tools"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        ALERTS[Alert Manager]
        LOGS[Log Aggregation]
    end

    API_RESPONSE --> PROMETHEUS
    DB_QUERIES --> PROMETHEUS
    CACHE_HIT --> PROMETHEUS
    WS_CONNECTIONS --> PROMETHEUS

    USER_ACTIVE --> PROMETHEUS
    PORTFOLIOS --> PROMETHEUS
    RISK_CALC --> PROMETHEUS
    AI_INSIGHTS --> PROMETHEUS

    CPU --> PROMETHEUS
    MEMORY --> PROMETHEUS
    DISK --> PROMETHEUS
    NETWORK --> PROMETHEUS

    API_HEALTH --> PROMETHEUS
    RATE_LIMITS --> PROMETHEUS
    ERROR_RATES --> PROMETHEUS

    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERTS
    PROMETHEUS --> LOGS
```

This comprehensive set of diagrams provides a complete visualization of your crypto risk dashboard architecture, covering all major components, data flows, and system interactions as specified in your prompt.
