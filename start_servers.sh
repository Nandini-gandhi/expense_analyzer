#!/bin/bash

echo "🚀 Starting Expense Analyzer Servers..."
echo ""

# Start Flask backend in background
cd "/Users/nandinigandhi/Desktop/Intermediate Python/expense-coach"
echo "📊 Starting Backend API on http://localhost:5001..."
/Users/nandinigandhi/miniforge3/envs/expense_analyser/bin/python api.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start React frontend in background  
cd "/Users/nandinigandhi/Desktop/Intermediate Python/expense-coach/Redesign Expense Analyzer UI"
echo "🎨 Starting Frontend UI on http://localhost:3000..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📊 Backend API:  http://localhost:5001"
echo "🌐 Frontend UI:  http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
