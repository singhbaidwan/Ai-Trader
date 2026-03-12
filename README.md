# AiTrader

AiTrader is an advanced AI-powered trading and investment analysis system. It leverages multi-agent architecture to simulate investment debates, gather real-time financial data, and provide reasoned trading recommendations.

## Overview

The system uses specialized AI agents that take on different roles (e.g., Bull Researcher, Bear Researcher, Risk Manager, Portfolio Manager) to thoroughly analyze market conditions, news, sentiment, and fundamental data. By facilitating debates between opposing viewpoints (Bull vs. Bear), the Portfolio Manager arrives at a balanced, well-reasoned investment decision (Buy, Sell, or Hold).

## Key Features

- **Multi-Agent Debates:** Incorporates agents that actively debate investment thesis (Bull and Bear researchers) to uncover strengths and weaknesses in potential trades.
- **Risk Management:** Dedicated risk management agents (Aggressive, Conservative, Neutral debators) to assess potential downsides.
- **Comprehensive Data Integration:** 
  - **Fundamental & Technical Data:** Integrates with Alpha Vantage and Yahoo Finance (`yfinance`).
  - **News & Sentiment:** Gathers insights from Google News and Reddit.
- **Memory & Learning:** The system recalls past decisions and their outcomes to avoid repeating mistakes and to continuously improve decision-making.
- **Configurable LLM Backends:** Supports multiple LLM providers through pluggable clients.

## Architecture

The project is structured into two main components:

### 1. Agents (`tradingAgents/agents/`)
- **Researchers:** Formulate initial bullish or bearish hypothesis based on data.
- **Risk Management:** Evaluate proposed trades against risk criteria.
- **Managers:** Facilitate the debate between differing agents and synthesize a final, actionable portfolio decision.

### 2. Dataflows (`tradingAgents/dataflows/`)
- Handles all external API interactions and data processing.
- Connectors for Alpha Vantage, Yahoo Finance, Google, and Reddit.
- Modules for calculating technical indicators (`stockstats`) and processing financial news.

## Getting Started

### Prerequisites

- Python 3.14.0 (as specified in `start.sh`, though earlier modern versions likely work)
- API keys based on selected providers (for example: Google API key for Gemini)

### Installation

1. Clone the repository.
2. Run the startup script to initialize the virtual environment and install dependencies:
   ```bash
   ./start.sh
   # or source setup.txt which runs: source .venv/bin/activate
   ```
3. Install Python requirements manually if needed:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Configure your environment variables (e.g., API keys) in a `.env` file at the root. Default settings for data vendors and LLMs can be modified in `tradingAgents/default_config.py`.

## LLM Clients

This repo currently supports the following LLM clients through `tradingAgents/llm_client/factory.py`:

- `google`: Gemini models via `GoogleClient`
- `local`: Any OpenAI-compatible local server via `LocalHuggingFaceClient`
- `ollama`: Alias of `local` with Ollama-friendly defaults

`tradingAgents/main.py` selects the provider using `LLM_PROVIDER`.

### Common Setup

1. Create and activate the virtual environment.
   ```bash
   cd /Users/dalveersingh/Downloads/Code/Agents/AiTrader
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies.
   ```bash
   pip install -r requirements.txt
   ```

### Run Google Client (`LLM_PROVIDER=google`)

1. Set environment variables.
   ```bash
   export LLM_PROVIDER=google
   export GOOGLE_API_KEY=your_google_api_key
   export GOOGLE_DEEP_MODEL=gemini-2.5-flash-lite
   export GOOGLE_QUICK_MODEL=gemini-2.5-flash-lite
   export GOOGLE_THINKING_LEVEL=minimal
   ```
2. Run the project.
   ```bash
   python3 tradingAgents/main.py
   ```

### Run Ollama Locally (`LLM_PROVIDER=ollama`, recommended on macOS)

`LocalHuggingFaceClient` expects an OpenAI-compatible local endpoint.
Ollama exposes one at `http://127.0.0.1:11434/v1`.

1. Install Ollama (one-time on macOS).
   ```bash
   brew install ollama
   ```
2. Start Ollama server in terminal 1 (keep it running).
   ```bash
   ollama serve
   ```
3. In terminal 2, pull a lightweight local model.
   ```bash
   ollama pull llama3.2:3b
   ```
4. (Optional) Check downloaded Ollama models.
   ```bash
   ollama list
   # or JSON API:
   curl http://127.0.0.1:11434/api/tags
   ```
5. In terminal 2, configure provider values.
   ```bash
   cd /Users/dalveersingh/Downloads/Code/Agents/AiTrader
   source .venv/bin/activate
   export LLM_PROVIDER=ollama
   export OLLAMA_MODEL=llama3.2:3b
   export OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
   ```
6. Verify Ollama API is reachable (avoids connection-refused errors).
   ```bash
   curl http://127.0.0.1:11434/api/tags
   ```
7. Run the project.
   ```bash
   python3 tradingAgents/main.py
   ```

If you get `Connection refused`, Ollama server is not running or URL is wrong.
Recheck:

```bash
echo $LLM_PROVIDER
echo $OLLAMA_BASE_URL
```

### Run `LLM_PROVIDER=local` with a custom endpoint

Use this if you want to point to any OpenAI-compatible server manually (including Ollama or vLLM):

```bash
export LLM_PROVIDER=local
export LOCAL_HF_MODEL=llama3.2:3b
export LOCAL_LLM_BASE_URL=http://127.0.0.1:11434/v1
export LOCAL_LLM_API_KEY=local
```

### Optional: vLLM (Linux + NVIDIA CUDA)

`vllm` is not a good default on macOS and commonly fails to install due to PyTorch wheel constraints.
If you are on supported Linux/CUDA hardware, you can still use:

```bash
pip install vllm
python -m vllm.entrypoints.openai.api_server \
  --host 127.0.0.1 \
  --port 8000 \
  --model Qwen/Qwen2.5-7B-Instruct
```

### Quick Provider Switch

- Use Ollama:
  ```bash
  export LLM_PROVIDER=ollama
  ```
- Use local:
  ```bash
  export LLM_PROVIDER=local
  ```
- Use Google:
  ```bash
  export LLM_PROVIDER=google
  ```
