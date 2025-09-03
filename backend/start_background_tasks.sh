#!/bin/bash

# Start Background Tasks for Crypto Risk Dashboard
# This script starts Celery worker and beat scheduler

echo "🚀 Starting Crypto Risk Dashboard Background Tasks..."

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Virtual environment not detected. Activating..."
    source venv/bin/activate
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if ! python -c "import redis; redis.Redis(host='localhost', port=6379, db=0).ping()" > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   docker run -d -p 6379:6379 redis:7-alpine"
    echo "   or"
    echo "   brew services start redis"
    exit 1
fi
echo "✅ Redis is running"

# Set environment variables if not set
export API_REDIS_URL=${API_REDIS_URL:-"redis://localhost:6379"}
export API_CELERY_BROKER_URL=${API_CELERY_BROKER_URL:-"redis://localhost:6379/1"}
export API_CELERY_RESULT_BACKEND=${API_CELERY_RESULT_BACKEND:-"redis://localhost:6379/2"}

echo "📋 Configuration:"
echo "   Redis URL: $API_REDIS_URL"
echo "   Celery Broker: $API_CELERY_BROKER_URL"
echo "   Celery Backend: $API_CELERY_RESULT_BACKEND"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down background tasks..."
    if [[ -n "$WORKER_PID" ]]; then
        kill $WORKER_PID 2>/dev/null
        echo "   Celery worker stopped"
    fi
    if [[ -n "$BEAT_PID" ]]; then
        kill $BEAT_PID 2>/dev/null
        echo "   Celery beat stopped"
    fi
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Celery worker in background
echo "👷 Starting Celery worker..."
celery -A app.background_tasks.celery_app worker \
    --loglevel=info \
    --concurrency=2 \
    --queues=crypto_data,market_data,blockchain_data,maintenance,monitoring \
    --hostname=worker@%h &
WORKER_PID=$!

# Wait a moment for worker to start
sleep 3

# Check if worker started successfully
if ! kill -0 $WORKER_PID 2>/dev/null; then
    echo "❌ Failed to start Celery worker"
    exit 1
fi
echo "✅ Celery worker started (PID: $WORKER_PID)"

# Start Celery beat scheduler in background
echo "⏰ Starting Celery beat scheduler..."
celery -A app.background_tasks.celery_app beat \
    --loglevel=info \
    --scheduler=celery.beat.PersistentScheduler &
BEAT_PID=$!

# Wait a moment for beat to start
sleep 3

# Check if beat started successfully
if ! kill -0 $BEAT_PID 2>/dev/null; then
    echo "❌ Failed to start Celery beat"
    kill $WORKER_PID 2>/dev/null
    exit 1
fi
echo "✅ Celery beat started (PID: $BEAT_PID)"

echo ""
echo "🎉 Background tasks are now running!"
echo "   Worker PID: $WORKER_PID"
echo "   Beat PID: $BEAT_PID"
echo ""
echo "📊 Monitor tasks with:"
echo "   celery -A app.background_tasks.celery_app inspect active"
echo "   celery -A app.background_tasks.celery_app inspect stats"
echo ""
echo "🛑 Press Ctrl+C to stop all tasks"

# Wait for background processes
wait
