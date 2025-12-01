#!/bin/bash

# Expense Analyzer Startup Script
# This script starts both the backend API and frontend dev server

echo "🚀 Starting Expense Analyzer..."
echo ""

# Check if we're in the right directory
if [ ! -f "api.py" ]; then
    echo "❌ Error: api.py not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python not found. Please install Python 3.8 or higher."
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo "📦 Checking Python dependencies..."
$PYTHON_CMD -c "import flask, flask_cors, pandas" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Some dependencies missing. Installing..."
    $PYTHON_CMD -m pip install -r requirements.txt
fi

echo ""
echo "🔧 Starting Backend API on http://localhost:5000..."
$PYTHON_CMD api.py &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

echo ""
echo "🎨 Starting Frontend on http://localhost:5173..."
cd "Redesign Expense Analyzer UI"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

cd ..

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📊 Backend API:  http://localhost:5000"
echo "🌐 Frontend UI:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Wait for both processes
wait
