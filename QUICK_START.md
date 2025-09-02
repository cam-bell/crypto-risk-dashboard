# Crypto Risk Dashboard - Quick Start Guide

## 🚀 Quick Setup

This guide will help you get the Crypto Risk Dashboard database up and running in minutes.

## Prerequisites

- **Docker & Docker Compose** installed and running
- **Python 3.9+** installed
- **Git** for cloning the repository

## 🏃‍♂️ One-Command Setup

Run the automated setup script:

```bash
./setup_database.sh
```

This script will:

1. ✅ Check Docker and port availability
2. 🐘 Start PostgreSQL with TimescaleDB
3. 🔴 Start Redis
4. 📦 Install Python dependencies
5. 🗄️ Run database migrations
6. 🌱 Seed with sample data
7. 🎯 Show connection information

## 🔧 Manual Setup (Alternative)

If you prefer manual setup or encounter issues:

### 1. Start Database Services

```bash
docker-compose up -d postgres redis
```

### 2. Wait for Services

```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready -U postgres -d crypto_risk_db

# Check Redis
docker-compose exec redis redis-cli ping
```

### 3. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Run Migrations

```bash
alembic upgrade head
```

### 5. Initialize Database

```bash
python init_db.py
```

## 🌐 Access Points

After setup, you can access:

- **PostgreSQL**: `localhost:5432`
  - Database: `crypto_risk_db`
  - Username: `postgres`
  - Password: `password`

- **Redis**: `localhost:6379`

- **pgAdmin**: `http://localhost:5050`
  - Email: `admin@cryptodashboard.com`
  - Password: `admin123`

## 📊 Sample Data

The database comes pre-loaded with:

- **Users**: Admin and demo user accounts
- **Crypto Assets**: Bitcoin, Ethereum, Cardano
- **Portfolios**: Sample portfolio with holdings
- **Price History**: 30 days of simulated price data
- **Risk Metrics**: Calculated risk indicators
- **AI Insights**: Sample AI-generated analysis
- **Alerts**: Price and portfolio notifications

## 🚀 Start the Application

### Backend API

```bash
cd backend
source venv/bin/activate
python main.py
```

Access API docs at: `http://localhost:8000/docs`

### Frontend (if available)

```bash
cd frontend
npm install
npm run dev
```

Access dashboard at: `http://localhost:3000`

## 🔍 Verify Setup

### Check Database Tables

```bash
docker-compose exec postgres psql -U postgres -d crypto_risk_db -c "\dt"
```

### Check TimescaleDB

```bash
docker-compose exec postgres psql -U postgres -d crypto_risk_db -c "SELECT timescaledb_version();"
```

### Check Sample Data

```bash
docker-compose exec postgres psql -U postgres -d crypto_risk_db -c "SELECT COUNT(*) FROM users;"
docker-compose exec postgres psql -U postgres -d crypto_risk_db -c "SELECT COUNT(*) FROM crypto_assets;"
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

#### Docker Not Running

```bash
# Start Docker Desktop or Docker daemon
# On macOS: open Docker Desktop
# On Linux: sudo systemctl start docker
```

#### Permission Denied

```bash
# Make script executable
chmod +x setup_database.sh
```

#### Database Connection Failed

```bash
# Check if services are running
docker-compose ps

# Check logs
docker-compose logs postgres
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove volumes
docker volume rm crypto-risk-dashboard_postgres_data crypto-risk-dashboard_redis_data

# Start fresh
./setup_database.sh
```

## 📚 Next Steps

1. **Explore the API**: Visit `http://localhost:8000/docs`
2. **Check the Database**: Use pgAdmin at `http://localhost:5050`
3. **Review the Schema**: Read `DATABASE_SCHEMA.md`
4. **Customize Data**: Modify `backend/init_db.py`
5. **Add Features**: Extend the models and API

## 🆘 Need Help?

- Check the logs: `docker-compose logs`
- Review the schema documentation: `DATABASE_SCHEMA.md`
- Check the requirements: `backend/requirements.txt`
- Verify Docker setup: `docker --version && docker-compose --version`

## 🎯 What's Next?

After successful setup, you can:

- **Develop APIs**: Build new endpoints using the models
- **Add Data Sources**: Integrate with crypto APIs
- **Implement AI**: Add machine learning models
- **Scale Up**: Deploy to production with the same schema
- **Monitor Performance**: Use TimescaleDB's built-in monitoring

---

**Happy Coding! 🚀**

The database is now ready for your crypto risk dashboard application.
