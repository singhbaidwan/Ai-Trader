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
- **Configurable LLM Backends:** Designed to work with Langchain and OpenAI models (defaultting to `gpt-4o-mini` / `o4-mini`).

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
- API Keys for OpenAI and Alpha Vantage

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
