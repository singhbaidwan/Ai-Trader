import os
import sys

if __package__ is None or __package__ == "":
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from tradingAgents.graph.trading_graph import TradingAgentsGraph
from tradingAgents.default_config import DEFAULT_CONFIG

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Choose provider: "local", "ollama", or "google"
provider = os.getenv("LLM_PROVIDER", "local").lower().strip()
config = DEFAULT_CONFIG.copy()

if provider == "google":
    config["llm_provider"] = "google"
    config["deep_think_llm"] = os.getenv("GOOGLE_DEEP_MODEL", "gemini-2.5-flash-lite")
    config["quick_think_llm"] = os.getenv("GOOGLE_QUICK_MODEL", "gemini-2.5-flash-lite")
    config["google_thinking_level"] = os.getenv("GOOGLE_THINKING_LEVEL", "minimal")
elif provider == "local":
    # Local model served by an OpenAI-compatible endpoint (e.g., Ollama or vLLM)
    local_model = os.getenv("LOCAL_HF_MODEL", "llama3.2:3b")
    config["llm_provider"] = "local"
    config["deep_think_llm"] = os.getenv("LOCAL_HF_DEEP_MODEL", local_model)
    config["quick_think_llm"] = os.getenv("LOCAL_HF_QUICK_MODEL", local_model)
    config["backend_url"] = os.getenv("LOCAL_LLM_BASE_URL", "http://127.0.0.1:11434/v1")
    config["local_api_key"] = os.getenv("LOCAL_LLM_API_KEY", "ollama")
elif provider == "ollama":
    # Ollama's OpenAI-compatible endpoint
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    config["llm_provider"] = "ollama"
    config["deep_think_llm"] = os.getenv("OLLAMA_DEEP_MODEL", ollama_model)
    config["quick_think_llm"] = os.getenv("OLLAMA_QUICK_MODEL", ollama_model)
    config["backend_url"] = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1")
    config["local_api_key"] = os.getenv("OLLAMA_API_KEY", "ollama")
else:
    raise ValueError(
        f"Unsupported LLM_PROVIDER '{provider}'. Use 'google', 'local', or 'ollama'."
    )

# Configure data vendors (default uses yfinance, no extra API keys needed)
config["data_vendors"] = {
    "core_stock_apis": "yfinance",           # Options: alpha_vantage, yfinance
    "technical_indicators": "yfinance",      # Options: alpha_vantage, yfinance
    "fundamental_data": "yfinance",          # Options: alpha_vantage, yfinance
    "news_data": "yfinance",                 # Options: alpha_vantage, yfinance
}

# Initialize with custom config
ta = TradingAgentsGraph(debug=True, config=config)

# forward propagate
_, decision = ta.propagate("NVDA", "2025-05-10")
print(decision)

# Memorize mistakes and reflect
# ta.reflect_and_remember(1000) # parameter is the position returns
