#!/bin/bash

# Crypto Risk Dashboard Setup Script
# This script automates the initial setup of the project

set -e

echo "🚀 Setting up Crypto Risk Dashboard..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+ and try again."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Please install npm 9+ and try again."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Please install Python 3.11+ and try again."; exit 1; }

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo "❌ npm 9+ is required. Current version: $(npm -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your API keys before starting the application"
else
    echo "✅ .env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

# Setup backend
echo "🐍 Setting up backend..."
cd backend
npm install
cd ..

# Start database services
echo "🗄️  Starting database services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if ! docker-compose ps | grep -q "crypto_risk_postgres.*Up"; then
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

if ! docker-compose ps | grep -q "crypto_risk_redis.*Up"; then
    echo "❌ Redis failed to start"
    exit 1
fi

echo "✅ Database services are running"

# Create database if it doesn't exist
echo "🗄️  Setting up database..."
docker exec crypto_risk_postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'crypto_risk_dashboard'" | grep -q 1 || \
docker exec crypto_risk_postgres psql -U postgres -c "CREATE DATABASE crypto_risk_dashboard"

# Enable TimescaleDB extension
echo "📊 Enabling TimescaleDB extension..."
docker exec crypto_risk_postgres psql -U postgres -d crypto_risk_dashboard -c "CREATE EXTENSION IF NOT EXISTS timescaledb;" 2>/dev/null || true

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Start the application: npm run dev"
echo "3. Access frontend: http://localhost:3000"
echo "4. Access backend: http://localhost:8000"
echo "5. View API docs: http://localhost:8000/docs"
echo ""
echo "🔧 Useful commands:"
echo "  npm run dev          - Start both frontend and backend"
echo "  npm run docker:up    - Start all services with Docker"
echo "  npm run docker:down  - Stop all Docker services"
echo "  npm run test         - Run all tests"
echo "  npm run lint         - Run linting"
echo ""
echo "🚀 Happy coding!"
