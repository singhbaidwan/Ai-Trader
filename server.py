"""
AiTrader FastAPI Backend Server
================================
Bridges the TradingAgents Python pipeline to the React frontend.

Endpoints:
  GET  /api/health             — Health check
  POST /api/analyze/{ticker}   — Full agent pipeline analysis
  GET  /api/analyze/{ticker}/stream — SSE streaming analysis
  GET  /api/quote/{ticker}     — Quick stock quote via yfinance
  GET  /api/news/{ticker}      — Recent news via yfinance
  GET  /api/config             — Current pipeline config
  PUT  /api/config             — Update pipeline config
"""

from __future__ import annotations

import json
import os
import threading
import traceback
from datetime import date, datetime
from typing import Any, AsyncGenerator, Dict, List, Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# Optional dependency: sse-starlette
# ---------------------------------------------------------------------------
try:
    from sse_starlette.sse import EventSourceResponse

    HAS_SSE = True
except ImportError:
    HAS_SSE = False

# ---------------------------------------------------------------------------
# Optional dependency: yfinance
# ---------------------------------------------------------------------------
try:
    import yfinance as yf

    HAS_YFINANCE = True
except ImportError:
    HAS_YFINANCE = False

# ---------------------------------------------------------------------------
# TradingAgents pipeline imports
# ---------------------------------------------------------------------------
try:
    from tradingAgents.default_config import DEFAULT_CONFIG
    from tradingAgents.graph.trading_graph import TradingAgentsGraph

    HAS_PIPELINE = True
except ImportError:
    HAS_PIPELINE = False
    DEFAULT_CONFIG = {
        "llm_provider": "local",
        "deep_think_llm": "llama3.2:3b",
        "quick_think_llm": "llama3.2:3b",
        "backend_url": "http://127.0.0.1:11434/v1",
        "max_debate_rounds": 1,
        "max_risk_discuss_rounds": 1,
        "max_recur_limit": 100,
    }

# ---------------------------------------------------------------------------
# App-level mutable config (deep-copied from DEFAULT_CONFIG)
# ---------------------------------------------------------------------------
_current_config: Dict[str, Any] = {**DEFAULT_CONFIG}

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    """Request body for the /api/analyze/{ticker} endpoint."""

    trade_date: Optional[str] = Field(
        default=None,
        description="Trade date in YYYY-MM-DD format. Defaults to today.",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )


class ConfigUpdate(BaseModel):
    """Request body for PUT /api/config."""

    llm_provider: Optional[str] = None
    deep_think_llm: Optional[str] = None
    quick_think_llm: Optional[str] = None
    backend_url: Optional[str] = None
    local_api_key: Optional[str] = None
    max_debate_rounds: Optional[int] = None
    max_risk_discuss_rounds: Optional[int] = None
    max_recur_limit: Optional[int] = None


class HealthResponse(BaseModel):
    status: str
    pipeline_available: bool
    yfinance_available: bool
    sse_available: bool


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AiTrader API",
    description="AI-powered stock intelligence backend",
    version="0.1.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===================================================================
# Helpers
# ===================================================================

def _safe_serialize(obj: Any) -> Any:
    """Recursively convert non-serializable objects to strings."""
    if isinstance(obj, dict):
        return {k: _safe_serialize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_safe_serialize(item) for item in obj]
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    # Fallback: stringify anything else
    return str(obj)


def _extract_state_payload(final_state: Dict[str, Any], decision: str) -> Dict[str, Any]:
    """Extract a JSON-serializable payload from the LangGraph final state."""
    invest_debate = final_state.get("investment_debate_state", {})
    risk_debate = final_state.get("risk_debate_state", {})

    payload = {
        "ticker": final_state.get("company_of_interest", ""),
        "trade_date": str(final_state.get("trade_date", "")),
        "market_report": final_state.get("market_report", ""),
        "sentiment_report": final_state.get("sentiment_report", ""),
        "news_report": final_state.get("news_report", ""),
        "fundamentals_report": final_state.get("fundamentals_report", ""),
        "investment_debate_state": {
            "bull_history": invest_debate.get("bull_history", []),
            "bear_history": invest_debate.get("bear_history", []),
            "history": invest_debate.get("history", []),
            "current_response": invest_debate.get("current_response", ""),
            "judge_decision": invest_debate.get("judge_decision", ""),
        },
        "investment_plan": final_state.get("investment_plan", ""),
        "trader_investment_plan": final_state.get("trader_investment_plan", ""),
        "risk_debate_state": {
            "aggressive_history": risk_debate.get("aggressive_history", []),
            "conservative_history": risk_debate.get("conservative_history", []),
            "neutral_history": risk_debate.get("neutral_history", []),
            "history": risk_debate.get("history", []),
            "judge_decision": risk_debate.get("judge_decision", ""),
        },
        "final_trade_decision": final_state.get("final_trade_decision", ""),
        "signal": decision,
    }
    return _safe_serialize(payload)


def _get_mock_quote(ticker: str) -> Dict[str, Any]:
    """Return mock quote data when yfinance is unavailable."""
    return {
        "ticker": ticker.upper(),
        "price": 0.0,
        "change": 0.0,
        "change_percent": 0.0,
        "open": 0.0,
        "high": 0.0,
        "low": 0.0,
        "close": 0.0,
        "volume": 0,
        "market_cap": 0,
        "pe_ratio": None,
        "dividend_yield": None,
        "name": ticker.upper(),
        "sector": "N/A",
        "industry": "N/A",
        "mock": True,
        "message": "yfinance not installed — returning placeholder data",
    }


def _get_mock_news(ticker: str) -> List[Dict[str, Any]]:
    """Return mock news data when yfinance is unavailable."""
    return [
        {
            "title": f"Mock headline for {ticker.upper()}",
            "source": "Mock Source",
            "time": datetime.now().isoformat(),
            "url": "#",
            "mock": True,
        }
    ]


# ===================================================================
# Endpoints
# ===================================================================


@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health-check endpoint."""
    return HealthResponse(
        status="ok",
        pipeline_available=HAS_PIPELINE,
        yfinance_available=HAS_YFINANCE,
        sse_available=HAS_SSE,
    )


# -------------------------------------------------------------------
# POST /api/analyze/{ticker}  — full synchronous analysis
# -------------------------------------------------------------------

@app.post("/api/analyze/{ticker}")
async def analyze_ticker(ticker: str, body: Optional[AnalyzeRequest] = None) -> Dict[str, Any]:
    """Run the full TradingAgents pipeline for *ticker*."""
    if not HAS_PIPELINE:
        raise HTTPException(
            status_code=503,
            detail="TradingAgents pipeline is not available. Check server logs.",
        )

    trade_date_str: str = (body.trade_date if body and body.trade_date else date.today().isoformat())

    try:
        ta = TradingAgentsGraph(debug=True, config=_current_config)
        final_state, decision = ta.propagate(ticker, trade_date_str)
        return _extract_state_payload(final_state, decision)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# -------------------------------------------------------------------
# GET /api/analyze/{ticker}/stream  — SSE streaming analysis
# -------------------------------------------------------------------

@app.get("/api/analyze/{ticker}/stream")
async def analyze_ticker_stream(ticker: str, request: Request, trade_date: Optional[str] = None):
    """SSE streaming version of the analysis pipeline.

    Sends events:
      - phase_start   — a new pipeline phase has begun
      - agent_complete — an individual agent finished
      - analysis_complete — the full pipeline finished
      - error         — something went wrong
    """
    if not HAS_SSE:
        raise HTTPException(status_code=503, detail="sse-starlette is not installed.")
    if not HAS_PIPELINE:
        raise HTTPException(status_code=503, detail="TradingAgents pipeline is not available.")

    effective_trade_date: str = trade_date or date.today().isoformat()

    import asyncio
    import queue

    event_queue: queue.Queue[Optional[Dict[str, Any]]] = queue.Queue()

    # ---- Background thread that drives the pipeline ----
    def _run_pipeline() -> None:
        try:
            _emit(event_queue, "phase_start", "initialization", "research",
                  "Initializing TradingAgents pipeline…")

            ta = TradingAgentsGraph(debug=True, config=_current_config)

            _emit(event_queue, "phase_start", "research", "research",
                  "Starting analyst research phase…")

            # Stream through the graph so we can emit per-chunk events.
            init_state = ta.propagator.create_initial_state(ticker, effective_trade_date)
            args = ta.propagator.get_graph_args()

            accumulated_state: dict = {}
            has_chunks = False
            for chunk in ta.graph.stream(init_state, **args):
                has_chunks = True
                # Detect which agent produced this chunk
                agent_name = _infer_agent_name(chunk)
                phase = _infer_phase(agent_name)

                content = _extract_agent_content(chunk, agent_name)
                _emit(event_queue, "agent_complete", agent_name, phase, content)
                # Accumulate state across all chunks
                for key, value in chunk.items():
                    if isinstance(value, dict):
                        if key not in accumulated_state:
                            accumulated_state[key] = {}
                        accumulated_state[key].update(value)
                    else:
                        accumulated_state[key] = value

            if not has_chunks:
                _emit(event_queue, "error", "pipeline", "research",
                      "Pipeline returned no results.")
                event_queue.put(None)
                return

            ta.curr_state = accumulated_state
            ta._log_state(effective_trade_date, accumulated_state)
            decision = ta.process_signal(accumulated_state.get("final_trade_decision", ""))

            payload = _extract_state_payload(accumulated_state, decision)
            _emit(event_queue, "analysis_complete", "pipeline", "complete",
                  json.dumps(payload))

        except Exception as exc:
            traceback.print_exc()
            _emit(event_queue, "error", "pipeline", "error", str(exc))
        finally:
            event_queue.put(None)  # sentinel

    def _emit(q: queue.Queue, event_type: str, agent: str, phase: str, content: str) -> None:
        q.put({
            "type": event_type,
            "agent": agent,
            "phase": phase,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })

    def _infer_agent_name(chunk: Dict[str, Any]) -> str:
        """Best-effort extraction of the agent name from a LangGraph chunk."""
        # LangGraph stream chunks are typically {node_name: state_update}
        keys = [k for k in chunk.keys() if k != "messages" and k != "__end__"]
        if keys:
            return keys[0]
        return "unknown"

    def _extract_agent_content(chunk: Dict[str, Any], agent_name: str) -> str:
        """Extract the most relevant content/report produced by this agent from the chunk."""
        node_data = chunk.get(agent_name, {})
        if not isinstance(node_data, dict):
            return str(node_data) if node_data else f"Agent '{agent_name}' completed."
        
        # Look for typical report/plan keys
        report_keys = [
            "market_report", "sentiment_report", "news_report", "fundamentals_report",
            "investment_plan", "trader_investment_plan", "final_trade_decision"
        ]
        for k in report_keys:
            if k in node_data and node_data[k]:
                return str(node_data[k])
                
        # Look for debate states
        invest_debate = node_data.get("investment_debate_state", {})
        if isinstance(invest_debate, dict) and invest_debate.get("current_response"):
            return str(invest_debate.get("current_response"))
            
        risk_debate = node_data.get("risk_debate_state", {})
        if isinstance(risk_debate, dict):
            if risk_debate.get("current_risky_response") and ("risky" in agent_name.lower() or "aggressive" in agent_name.lower()):
                return str(risk_debate.get("current_risky_response"))
            elif risk_debate.get("current_safe_response") and ("safe" in agent_name.lower() or "conservative" in agent_name.lower()):
                return str(risk_debate.get("current_safe_response"))
            elif risk_debate.get("current_neutral_response") and "neutral" in agent_name.lower():
                return str(risk_debate.get("current_neutral_response"))
                
        return f"Agent '{agent_name}' completed."

    def _infer_phase(agent_name: str) -> str:
        """Map agent names to high-level pipeline phases."""
        research_agents = {"market_analyst", "social_analyst", "news_analyst", "fundamentals_analyst",
                           "market", "social", "news", "fundamentals",
                           "market_analyst_tools", "social_analyst_tools",
                           "news_analyst_tools", "fundamentals_analyst_tools"}
        debate_agents = {"bull_researcher", "bear_researcher", "invest_judge",
                         "investment_debate", "risk_debate",
                         "aggressive_debater", "conservative_debater", "neutral_debater",
                         "risk_judge"}
        trade_agents = {"trader", "risk_manager", "portfolio_manager", "final_decision"}

        lower = agent_name.lower()
        if lower in research_agents:
            return "research"
        if lower in debate_agents:
            return "debate"
        if lower in trade_agents:
            return "trading"
        return "processing"

    # Kick off the pipeline in a background thread
    thread = threading.Thread(target=_run_pipeline, daemon=True)
    thread.start()

    async def _event_generator() -> AsyncGenerator[Dict[str, str], None]:
        loop = asyncio.get_running_loop()
        while True:
            # Check for client disconnect
            if await request.is_disconnected():
                break
            # Non-blocking get from the queue
            try:
                event = await loop.run_in_executor(None, lambda: event_queue.get(timeout=0.5))
            except Exception:
                continue
            if event is None:
                break  # sentinel → pipeline finished
            yield {
                "event": event["type"],
                "data": json.dumps(event),
            }

    return EventSourceResponse(_event_generator())


# -------------------------------------------------------------------
# GET /api/quote/{ticker}  — quick stock data
# -------------------------------------------------------------------

@app.get("/api/quote/{ticker}")
async def get_quote(ticker: str) -> Dict[str, Any]:
    """Return a quick stock quote for *ticker*."""
    if not HAS_YFINANCE:
        return _get_mock_quote(ticker)

    try:
        t = yf.Ticker(ticker)
        info = t.info or {}
        hist = t.history(period="2d")

        # Current price fallback chain
        price: float = info.get("currentPrice") or info.get("regularMarketPrice") or 0.0
        prev_close: float = info.get("previousClose") or info.get("regularMarketPreviousClose") or 0.0
        change = price - prev_close if (price and prev_close) else 0.0
        change_pct = (change / prev_close * 100) if prev_close else 0.0

        # OHLCV from most recent trading day
        latest = {}
        if not hist.empty:
            row = hist.iloc[-1]
            latest = {
                "open": round(float(row.get("Open", 0)), 2),
                "high": round(float(row.get("High", 0)), 2),
                "low": round(float(row.get("Low", 0)), 2),
                "close": round(float(row.get("Close", 0)), 2),
                "volume": int(row.get("Volume", 0)),
            }

        officers = info.get("companyOfficers", [])
        ceo = officers[0].get("name", "N/A") if officers else "N/A"
        
        location_parts = [info.get("city"), info.get("state"), info.get("country")]
        headquarters = ", ".join([p for p in location_parts if p]) or "N/A"

        return {
            "ticker": ticker.upper(),
            "price": round(price, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
            **latest,
            "marketCap": info.get("marketCap"),
            "peRatio": info.get("trailingPE"),
            "forwardPe": info.get("forwardPE"),
            "dividendYield": info.get("dividendYield"),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "exchange": info.get("exchange", "N/A"),
            "website": info.get("website", "N/A"),
            "about": info.get("longBusinessSummary", "N/A"),
            "ceo": ceo,
            "employees": info.get("fullTimeEmployees", "N/A"),
            "headquarters": headquarters,
            "name": info.get("shortName", ticker.upper()),
        }
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# -------------------------------------------------------------------
# GET /api/news/{ticker}  — recent news
# -------------------------------------------------------------------

@app.get("/api/news/{ticker}")
async def get_news(ticker: str) -> List[Dict[str, Any]]:
    """Return recent news articles for *ticker*."""
    if not HAS_YFINANCE:
        return _get_mock_news(ticker)

    try:
        t = yf.Ticker(ticker)

        # yfinance >=0.2.31 exposes get_news(); fall back to .news property
        try:
            raw_news = t.get_news(count=10)
        except (AttributeError, TypeError):
            raw_news = getattr(t, "news", []) or []

        articles: List[Dict[str, Any]] = []
        for item in raw_news:
            # yfinance news items can be dicts or objects
            if isinstance(item, dict):
                articles.append({
                    "title": item.get("title", ""),
                    "source": item.get("publisher", item.get("source", "")),
                    "time": _format_timestamp(item.get("providerPublishTime", item.get("publishedAt"))),
                    "url": item.get("link", item.get("url", "#")),
                    "thumbnail": item.get("thumbnail", {}).get("resolutions", [{}])[0].get("url")
                                 if isinstance(item.get("thumbnail"), dict) else None,
                })
            else:
                articles.append({
                    "title": str(item),
                    "source": "",
                    "time": datetime.now().isoformat(),
                    "url": "#",
                })

        return articles
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def _format_timestamp(ts: Any) -> str:
    """Convert a Unix timestamp or ISO string to ISO-8601."""
    if ts is None:
        return datetime.now().isoformat()
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts).isoformat()
    return str(ts)


# -------------------------------------------------------------------
# GET / PUT  /api/config
# -------------------------------------------------------------------

@app.get("/api/config")
async def get_config() -> Dict[str, Any]:
    """Return the current pipeline configuration."""
    # Omit sensitive keys from the response
    safe_config = {k: v for k, v in _current_config.items() if k != "local_api_key"}
    safe_config["has_api_key"] = bool(_current_config.get("local_api_key"))
    return safe_config


@app.put("/api/config")
async def update_config(body: ConfigUpdate) -> Dict[str, Any]:
    """Update the pipeline configuration. Only provided fields are changed."""
    global _current_config

    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No configuration fields provided.")

    _current_config.update(update_data)
    return {"status": "updated", "config": {k: v for k, v in _current_config.items() if k != "local_api_key"}}


# ===================================================================
# Entry point
# ===================================================================

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
