# Crypto Risk Dashboard - Setup Instructions

## 🚀 Quick Start

This project is a monorepo containing a Next.js frontend and FastAPI backend for an AI-powered crypto risk dashboard.

## 📋 Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **Docker** and **Docker Compose**
- **Git**

## 🛠️ Installation Options

### Option 1: Docker (Recommended for Development)

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd crypto-risk-dashboard
   ```

2. **Copy environment file**

   ```bash
   cp env.example .env
   ```

3. **Update environment variables**
   Edit `.env` file with your API keys:

   - `OPENAI_API_KEY`
   - `COINGECKO_API_KEY`
   - `ETHERSCAN_API_KEY`
   - `ALPHAVANTAGE_API_KEY`

4. **Start with Docker**

   ```bash
   # Start all services
   npm run docker:up

   # Or use docker-compose directly
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

1. **Install root dependencies**

   ```bash
   npm install
   ```

2. **Setup frontend**

   ```bash
   cd frontend
   npm install
   ```

3. **Setup backend**

   ```bash
   cd backend
   npm install
   npm run setup:python
   ```

4. **Setup database**

   ```bash
   # Start PostgreSQL and Redis with Docker
   docker-compose up -d postgres redis

   # Run migrations
   npm run db:migrate
   ```

5. **Start development servers**

   ```bash
   # From root directory
   npm run dev

   # Or start separately
   npm run dev:frontend    # Frontend on :3000
   npm run dev:backend     # Backend on :8000
   ```

## 🗄️ Database Setup

### PostgreSQL with TimescaleDB

The project uses TimescaleDB (PostgreSQL extension) for time-series data:

```bash
# Create database
docker exec -it crypto_risk_postgres psql -U postgres -d crypto_risk_dashboard

# Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### Redis

Redis is used for caching and session management:

```bash
# Test Redis connection
docker exec -it crypto_risk_redis redis-cli ping
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# API Keys
OPENAI_API_KEY=your-openai-key
COINGECKO_API_KEY=your-coingecko-key
ETHERSCAN_API_KEY=your-etherscan-key
ALPHAVANTAGE_API_KEY=your-alphavantage-key

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crypto_risk_dashboard
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret
SECRET_KEY=your-secret-key
```

### Frontend Configuration

- **Next.js**: Configured with TypeScript, Tailwind CSS, and app directory
- **Theme**: Dark/light mode support with `next-themes`
- **State Management**: React Query for server state, local state with hooks

### Backend Configuration

- **FastAPI**: RESTful API with automatic documentation
- **Database**: SQLAlchemy ORM with Alembic migrations
- **Authentication**: JWT-based with bcrypt password hashing
- **Caching**: Redis for performance optimization

## 📁 Project Structure

```
crypto-risk-dashboard/
├── frontend/                 # Next.js 14 frontend
│   ├── app/                 # App directory (Next.js 13+)
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
├── backend/                 # FastAPI backend
│   ├── app/                 # Application code
│   ├── api/                 # API routes
│   ├── core/                # Core configuration
│   ├── db/                  # Database models
│   └── services/            # Business logic
├── docker-compose.yml       # Development environment
├── .github/workflows/       # CI/CD pipelines
└── README.md                # Project documentation
```

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Backend Tests

```bash
cd backend
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### E2E Tests

```bash
# Coming soon with Playwright
npm run test:e2e
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect repository to Vercel**
2. **Set environment variables**
3. **Deploy automatically on push to main**

### Backend (Railway/Render)

1. **Connect repository**
2. **Set environment variables**
3. **Configure build commands**
4. **Set health check endpoint**

### Database

- **Production**: Managed PostgreSQL with TimescaleDB
- **Backup**: Automated daily backups
- **Monitoring**: Connection pooling and query optimization

## 🔍 Monitoring & Logging

### Application Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Health Checks**: `/health` endpoint for load balancers

### Database Monitoring

- **Query Performance**: Slow query detection
- **Connection Pooling**: Monitor connection usage
- **TimescaleDB**: Hypertable compression and retention policies

## 🛡️ Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: API rate limiting per user/IP
- **CORS**: Configured for production domains

### Data Protection

- **Input Validation**: Pydantic models for API validation
- **SQL Injection**: Parameterized queries with SQLAlchemy
- **XSS Protection**: Content Security Policy headers
- **HTTPS**: Enforced in production

## 📊 Performance

### Frontend Optimization

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Lighthouse**: Performance monitoring

### Backend Optimization

- **Async Operations**: FastAPI async endpoints
- **Database Indexing**: Optimized queries with proper indexes
- **Caching Strategy**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :8000
   ```

2. **Database connection issues**

   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres

   # Check logs
   docker logs crypto_risk_postgres
   ```

3. **Frontend build issues**

   ```bash
   # Clear Next.js cache
   rm -rf frontend/.next
   npm run build
   ```

4. **Backend import errors**
   ```bash
   # Check Python path
   export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
   ```

### Getting Help

- **Issues**: Create GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check README.md and inline code comments

## 🔄 Development Workflow

### Git Workflow

1. **Feature branches**: Create from `develop`
2. **Pull requests**: Required for all changes
3. **Code review**: At least one approval required
4. **Merge strategy**: Squash and merge to maintain clean history

### Code Quality

- **Linting**: ESLint (frontend) + Flake8 (backend)
- **Formatting**: Prettier (frontend) + Black (backend)
- **Type Checking**: TypeScript + MyPy
- **Testing**: Minimum 80% coverage required

## 📈 Scaling Considerations

### Horizontal Scaling

- **Load Balancers**: Multiple backend instances
- **Database**: Read replicas for analytics
- **Caching**: Redis cluster for high availability

### Vertical Scaling

- **Database**: Optimize queries and indexes
- **Backend**: Increase worker processes
- **Frontend**: CDN for static assets

## 🎯 Next Steps

1. **Set up your API keys** in the `.env` file
2. **Start the development environment** with Docker
3. **Explore the API documentation** at `/docs`
4. **Customize the frontend components** for your needs
5. **Implement real data sources** and AI integration
6. **Add your own risk metrics** and analysis

## 📞 Support

For questions and support:

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and help
- **Email**: [Your contact information]

---

**Happy coding! 🚀**
