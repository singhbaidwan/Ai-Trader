#!/bin/bash
# stop-app.sh - Stop both AiTrader backend and frontend

if [ -f .app-pids ]; then
    echo "Stopping AiTrader Application..."
    
    # Read PIDs
    BACKEND_PID=$(sed -n '1p' .app-pids)
    FRONTEND_PID=$(sed -n '2p' .app-pids)
    
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "Stopped Backend (PID: $BACKEND_PID)"
    fi
    
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "Stopped Frontend (PID: $FRONTEND_PID)"
    fi
    
    # Clean up node/vite processes just in case
    pkill -f "vite"
    
    # Stop Ollama if we started it
    if [ -f .ollama-pid ]; then
        OLLAMA_PID=$(cat .ollama-pid)
        if kill -0 $OLLAMA_PID 2>/dev/null; then
            kill $OLLAMA_PID
            echo "Stopped Ollama (PID: $OLLAMA_PID)"
        fi
        rm .ollama-pid
    fi

    rm .app-pids
    echo "AiTrader stopped."
else
    echo "No .app-pids file found. Is the app running?"
    # Cleanup anyway just in case
    pkill -f "venv/bin/uvicorn server:app"
    pkill -f "vite"
    pkill -f "ollama serve"
    echo "Force stopped related processes."
fi
