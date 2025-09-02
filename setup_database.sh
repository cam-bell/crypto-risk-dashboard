#!/bin/bash

# Crypto Risk Dashboard Database Setup Script
# This script sets up the complete database environment

set -e

echo "🚀 Crypto Risk Dashboard Database Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if required ports are available
check_ports() {
    print_status "Checking required ports..."
    
    local ports=("5432" "6379" "5050")
    local port_names=("PostgreSQL" "Redis" "pgAdmin")
    
    for i in "${!ports[@]}"; do
        if lsof -Pi :${ports[$i]} -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port ${ports[$i]} (${port_names[$i]}) is already in use"
            read -p "Do you want to continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            print_success "Port ${ports[$i]} (${port_names[$i]}) is available"
        fi
    done
}

# Start Docker services
start_services() {
    print_status "Starting Docker services..."
    
    if docker-compose up -d postgres redis; then
        print_success "Docker services started successfully"
    else
        print_error "Failed to start Docker services"
        exit 1
    fi
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    docker-compose run --rm postgres pg_isready -U postgres -d crypto_risk_db -h postgres
    print_success "PostgreSQL is ready"
    
    docker-compose run --rm redis redis-cli -h redis ping
    print_success "Redis is ready"
}

# Wait for database to be ready
wait_for_database() {
    print_status "Waiting for database to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U postgres -d crypto_risk_db > /dev/null 2>&1; then
            print_success "Database is ready"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts: Database not ready yet, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Database failed to become ready after $max_attempts attempts"
    exit 1
}

# Install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    if pip install -r requirements.txt; then
        print_success "Python dependencies installed successfully"
    else
        print_error "Failed to install Python dependencies"
        exit 1
    fi
    
    cd ..
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    source venv/bin/activate
    
    # Check if alembic is installed
    if ! command -v alembic &> /dev/null; then
        print_error "Alembic is not installed. Please check your requirements.txt"
        exit 1
    fi
    
    # Run migrations
    if alembic upgrade head; then
        print_success "Database migrations completed successfully"
    else
        print_error "Database migrations failed"
        exit 1
    fi
    
    cd ..
}

# Initialize database with seed data
initialize_database() {
    print_status "Initializing database with seed data..."
    
    cd backend
    source venv/bin/activate
    
    if python init_db.py; then
        print_success "Database initialized successfully"
    else
        print_error "Database initialization failed"
        exit 1
    fi
    
    cd ..
}

# Show connection information
show_connection_info() {
    echo
    echo "🎯 Database Setup Complete!"
    echo "=========================="
    echo
    echo "📊 Connection Information:"
    echo "  PostgreSQL: localhost:5432"
    echo "  Database: crypto_risk_db"
    echo "  Username: postgres"
    echo "  Password: password"
    echo
    echo "🔴 Redis: localhost:6379"
    echo
    echo "🌐 pgAdmin: http://localhost:5050"
    echo "  Email: admin@cryptodashboard.com"
    echo "  Password: admin123"
    echo
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo
    echo "🚀 Next Steps:"
    echo "  1. Start the backend API: cd backend && python main.py"
    echo "  2. Access the dashboard at: http://localhost:3000"
    echo "  3. Use pgAdmin to explore the database"
    echo
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo
    
    check_docker
    check_ports
    start_services
    wait_for_database
    install_dependencies
    run_migrations
    initialize_database
    show_connection_info
    
    print_success "Setup completed successfully! 🎉"
}

# Handle script interruption
trap 'print_error "Setup interrupted by user"; exit 1' INT

# Run main function
main "$@"
