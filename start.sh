#!/bin/bash

# Expense Analyzer Startup Script
# Starts both Flask backend and React frontend

echo "🚀 Starting Expense Analyzer..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating template..."
    echo "GEMINI_API_KEY=your_api_key_here" > .env
    echo "📝 Please edit .env and add your Google Gemini API key"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Flask backend
echo "📡 Starting Flask backend on port 5001..."
/Users/nandinigandhi/miniforge3/envs/expense_analyser/bin/python api.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start React frontend
echo "🎨 Starting React frontend on port 3000..."
cd "Redesign Expense Analyzer UI"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Expense Analyzer is running!"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
