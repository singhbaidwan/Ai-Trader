#!/bin/bash
# start-app.sh - Start both AiTrader backend and frontend

echo "Starting AiTrader Application..."

# Start Ollama if not running
if ! curl -s http://127.0.0.1:11434 > /dev/null; then
    echo "Starting Ollama Server..."
    OLLAMA_HOST=127.0.0.1:11434 ollama serve > ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo $OLLAMA_PID > .ollama-pid
    sleep 3 # Give it a moment to boot
else
    echo "Ollama Server is already running."
fi

# Start backend (FastAPI)
echo "Starting Backend on http://127.0.0.1:8000..."
venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000 &
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
