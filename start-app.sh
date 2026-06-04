#!/bin/bash
# start-app.sh - Start both AiTrader backend and frontend

echo "Starting AiTrader Application..."

# Start backend (FastAPI)
echo "Starting Backend on http://127.0.0.1:8000..."
uvicorn server:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo $BACKEND_PID > .app-pids

# Start frontend (Vite)
echo "Starting Frontend on http://127.0.0.1:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID >> ../.app-pids

echo ""
echo "=================================================="
echo "AiTrader is running!"
echo "- Backend: http://127.0.0.1:8000"
echo "- Frontend: http://127.0.0.1:5173"
echo "To stop, run: ./stop-app.sh"
echo "=================================================="
