/* ──────────────────────────────────────────────────────────
   AiTrader — API Service Layer
   Fetches data from FastAPI backend with mock fallback
   ────────────────────────────────────────────────────────── */

import type {
  AgentAnalysis,
  StreamEvent,
  NewsItem,
  AppConfig,
  TradeAction,
} from "@/types";
import { getStockProfile } from "@/data/stocks";

const API_BASE = "/api";

// ── Helpers ──

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

// ── Health Check ──

export async function checkHealth(): Promise<boolean> {
  try {
    const data = await request<{ status: string }>("/health");
    return data.status === "ok";
  } catch {
    return false;
  }
}

// ── Quick Quote (yfinance, ~1s) ──

export interface QuoteResponse {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  forwardPe: number;
  dividendYield: string;
  sector: string;
  industry: string;
  exchange: string;
  website: string;
  about: string;
  ceo: string;
  employees: string;
  headquarters: string;
}

export async function fetchQuote(ticker: string): Promise<QuoteResponse> {
  try {
    return await request<QuoteResponse>(`/quote/${ticker.toUpperCase()}`);
  } catch {
    // Fallback to mock data
    const profile = getStockProfile(ticker);
    return {
      ticker: profile.ticker,
      name: profile.name,
      price: profile.price,
      change: profile.change,
      changePercent: profile.changePercent,
      open: profile.open,
      high: profile.high,
      low: profile.low,
      volume: profile.volume,
      marketCap: profile.marketCap,
      peRatio: profile.peRatio,
      forwardPe: profile.forwardPe,
      dividendYield: profile.dividendYield,
      sector: profile.sector,
      industry: profile.industry,
      exchange: profile.exchange,
      website: profile.website,
      about: profile.about,
      ceo: profile.ceo,
      employees: profile.employees,
      headquarters: profile.headquarters,
    };
  }
}

// ── News ──

export async function fetchNews(ticker: string): Promise<NewsItem[]> {
  try {
    return await request<NewsItem[]>(`/news/${ticker.toUpperCase()}`);
  } catch {
    const profile = getStockProfile(ticker);
    return profile.news;
  }
}

function mapBackendAnalysis(data: any): AgentAnalysis {
  return {
    ticker: data.ticker || "",
    tradeDate: data.trade_date || new Date().toISOString().split("T")[0],
    signal: data.signal || "HOLD",
    // These attributes are dummy/missing from backend endpoint:
    confidence: 0,
    aiScore: 0,
    riskScore: 0,
    riskTone: "Moderate",
    sentiment: "Mixed",
    
    marketReport: data.market_report || "",
    sentimentReport: data.sentiment_report || "",
    newsReport: data.news_report || "",
    fundamentalsReport: data.fundamentals_report || "",
    
    investmentDebate: {
      bullHistory: data.investment_debate_state?.bull_history || "",
      bearHistory: data.investment_debate_state?.bear_history || "",
      history: data.investment_debate_state?.history || "",
      currentResponse: data.investment_debate_state?.current_response || "",
      judgeDecision: data.investment_debate_state?.judge_decision || "",
      count: data.investment_debate_state?.count || 0,
    },
    investmentPlan: data.investment_plan || "",
    traderPlan: data.trader_investment_plan || "",
    
    riskDebate: {
      aggressiveHistory: data.risk_debate_state?.aggressive_history || "",
      conservativeHistory: data.risk_debate_state?.conservative_history || "",
      neutralHistory: data.risk_debate_state?.neutral_history || "",
      history: data.risk_debate_state?.history || "",
      judgeDecision: data.risk_debate_state?.judge_decision || "",
      count: data.risk_debate_state?.count || 0,
    },
    finalDecision: data.final_trade_decision || "",
    
    debateTrace: [],
    timestamp: new Date().toISOString(),
  };
}

// ── Full Agent Analysis (blocking) ──

export async function analyzeStock(
  ticker: string,
  tradeDate?: string
): Promise<AgentAnalysis> {
  try {
    const data = await request<any>(`/analyze/${ticker.toUpperCase()}`, {
      method: "POST",
      body: JSON.stringify({
        trade_date: tradeDate || new Date().toISOString().split("T")[0],
      }),
    });
    return mapBackendAnalysis(data);
  } catch {
    // Return a mock analysis
    return getMockAnalysis(ticker);
  }
}

// ── SSE Streaming Analysis ──

export function streamAnalysis(
  ticker: string,
  callbacks: {
    onEvent: (event: StreamEvent) => void;
    onComplete: (analysis: AgentAnalysis) => void;
    onError: (error: Error) => void;
  }
): () => void {
  const url = `${API_BASE}/analyze/${ticker.toUpperCase()}/stream`;
  let eventSource: EventSource | null = null;

  try {
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        callbacks.onEvent(data);

        if (data.type === "analysis_complete" && data.data) {
          let parsedData = data.data;
          if (typeof parsedData === "string") {
            try { parsedData = JSON.parse(parsedData); } catch(e){}
          }
          callbacks.onComplete(mapBackendAnalysis(parsedData));
          eventSource?.close();
        }
      } catch (e) {
        console.warn("Failed to parse SSE event:", e);
      }
    };

    eventSource.onerror = () => {
      eventSource?.close();
      // Fallback: run mock analysis with simulated streaming
      simulateStreamingAnalysis(ticker, callbacks);
    };
  } catch {
    simulateStreamingAnalysis(ticker, callbacks);
  }

  return () => {
    eventSource?.close();
  };
}

// ── Config ──

export async function fetchConfig(): Promise<AppConfig | null> {
  try {
    return await request<AppConfig>("/config");
  } catch {
    return null;
  }
}

export async function updateConfig(
  config: Partial<AppConfig>
): Promise<AppConfig | null> {
  try {
    return await request<AppConfig>("/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  } catch {
    return null;
  }
}

// ── Mock / Fallback Helpers ──

function getMockAnalysis(ticker: string): AgentAnalysis {
  const profile = getStockProfile(ticker);
  const signalMap: Record<string, TradeAction> = {
    Bullish: "BUY",
    Neutral: "HOLD",
    Bearish: "SELL",
  };

  return {
    ticker: profile.ticker,
    tradeDate: new Date().toISOString().split("T")[0],
    signal: signalMap[profile.signal] || "HOLD",
    confidence: profile.confidence,
    aiScore: profile.aiScore,
    riskScore: profile.riskScore,
    riskTone: profile.riskTone,
    sentiment: profile.sentiment,
    marketReport: `## Market Analysis for ${profile.ticker}\n\nBased on technical indicators, ${profile.name} shows ${profile.signal.toLowerCase()} momentum with key support and resistance levels identified. Volume trends suggest ${profile.volume} daily average vs ${profile.avgVolume} 10-day average.`,
    sentimentReport: `## Sentiment Analysis\n\nOverall market sentiment for ${profile.name} is **${profile.sentiment}**. Social media discussions highlight strong interest in the company's recent developments.`,
    newsReport: `## News Analysis\n\nRecent news coverage for ${profile.name} has been largely ${profile.sentiment.toLowerCase()}. Key developments include industry trends and company-specific announcements.`,
    fundamentalsReport: `## Fundamental Analysis\n\n- **P/E Ratio**: ${profile.peRatio}\n- **Forward P/E**: ${profile.forwardPe}\n- **Revenue**: ${profile.revenue}\n- **Gross Margin**: ${profile.grossMargin}\n- **Net Margin**: ${profile.netMargin}\n- **ROE**: ${profile.roe}`,
    investmentDebate: {
      bullHistory: `**Bull Case for ${profile.ticker}:**\n\nStrong competitive moat with ${profile.grossMargin} gross margins. The company's position in ${profile.industry} provides durable growth prospects. Forward P/E of ${profile.forwardPe} suggests reasonable valuation relative to growth.`,
      bearHistory: `**Bear Case for ${profile.ticker}:**\n\nValuation concerns persist with P/E at ${profile.peRatio}. Competitive pressures in ${profile.industry} could compress margins. Debt/equity ratio of ${profile.debtEquity} warrants monitoring.`,
      history: "Investment debate conducted between Bull and Bear researchers.",
      currentResponse: "",
      judgeDecision: `After weighing both arguments, the investment case for ${profile.ticker} is **${profile.signal}** with ${profile.confidence}% confidence.`,
      count: 2,
    },
    investmentPlan: `## Investment Plan\n\n**Recommendation**: ${signalMap[profile.signal]}\n\n${profile.name} presents a ${profile.signal.toLowerCase()} opportunity based on fundamental strength and technical momentum.`,
    traderPlan: `Based on the investment plan analysis, the trading recommendation for ${profile.ticker} is **${signalMap[profile.signal]}** with a 1-3 month horizon.\n\nFINAL TRANSACTION PROPOSAL: **${signalMap[profile.signal]}**`,
    riskDebate: {
      aggressiveHistory: `The aggressive perspective supports taking a position in ${profile.ticker} given the strong growth metrics and market momentum.`,
      conservativeHistory: `From a conservative standpoint, the current valuation at ${profile.peRatio}x earnings requires caution. Position sizing should be limited.`,
      neutralHistory: `A balanced view suggests ${profile.ticker} offers reasonable risk-reward. Key risk factors include sector concentration and valuation multiples.`,
      history: "Risk debate conducted between Aggressive, Conservative, and Neutral analysts.",
      judgeDecision: `Risk assessment: **${profile.riskTone}** (Score: ${profile.riskScore}/100). The portfolio can accommodate this position within risk parameters.`,
      count: 3,
    },
    finalDecision: `## Final Trading Decision for ${profile.ticker}\n\n**Signal**: ${signalMap[profile.signal]}\n**Confidence**: ${profile.confidence}%\n**Risk Level**: ${profile.riskTone}\n\n${profile.name} has been evaluated through comprehensive multi-agent analysis including technical, fundamental, sentiment, and news assessment. The investment debate between bull and bear researchers has been adjudicated, and risk management review completed.\n\n**Final Recommendation**: ${signalMap[profile.signal]}`,
    debateTrace: [
      { agent: "Market Analyst", role: "analyst", content: "Technical analysis complete.", timestamp: new Date().toISOString() },
      { agent: "Sentiment Analyst", role: "analyst", content: "Sentiment analysis complete.", timestamp: new Date().toISOString() },
      { agent: "News Analyst", role: "analyst", content: "News analysis complete.", timestamp: new Date().toISOString() },
      { agent: "Fundamentals Analyst", role: "analyst", content: "Fundamental analysis complete.", timestamp: new Date().toISOString() },
      { agent: "Bull Researcher", role: "bull", content: "Bull thesis presented.", timestamp: new Date().toISOString() },
      { agent: "Bear Researcher", role: "bear", content: "Bear thesis presented.", timestamp: new Date().toISOString() },
      { agent: "Research Manager", role: "manager", content: "Investment debate adjudicated.", timestamp: new Date().toISOString() },
      { agent: "Trader", role: "trader", content: `Trading decision: ${signalMap[profile.signal]}`, timestamp: new Date().toISOString() },
      { agent: "Risk Judge", role: "manager", content: `Risk assessment: ${profile.riskTone}`, timestamp: new Date().toISOString() },
    ],
    timestamp: new Date().toISOString(),
  };
}

function simulateStreamingAnalysis(
  ticker: string,
  callbacks: {
    onEvent: (event: StreamEvent) => void;
    onComplete: (analysis: AgentAnalysis) => void;
    onError: (error: Error) => void;
  }
): void {
  const phases = [
    { phase: "Data Gathering", agent: "Market Analyst", delay: 400 },
    { phase: "Data Gathering", agent: "Sentiment Analyst", delay: 600 },
    { phase: "Data Gathering", agent: "News Analyst", delay: 500 },
    { phase: "Data Gathering", agent: "Fundamentals Analyst", delay: 700 },
    { phase: "Investment Debate", agent: "Bull Researcher", delay: 800 },
    { phase: "Investment Debate", agent: "Bear Researcher", delay: 800 },
    { phase: "Investment Debate", agent: "Research Manager", delay: 600 },
    { phase: "Trading Decision", agent: "Trader", delay: 500 },
    { phase: "Risk Assessment", agent: "Aggressive Analyst", delay: 600 },
    { phase: "Risk Assessment", agent: "Conservative Analyst", delay: 600 },
    { phase: "Risk Assessment", agent: "Neutral Analyst", delay: 600 },
    { phase: "Risk Assessment", agent: "Risk Judge", delay: 700 },
  ];

  let currentPhase = "";
  let cumDelay = 0;

  phases.forEach((step) => {
    if (step.phase !== currentPhase) {
      currentPhase = step.phase;
      const phaseDelay = cumDelay;
      setTimeout(() => {
        callbacks.onEvent({
          type: "phase_start",
          phase: step.phase,
          timestamp: new Date().toISOString(),
        });
      }, phaseDelay);
    }

    cumDelay += step.delay;
    const agentDelay = cumDelay;

    setTimeout(() => {
      callbacks.onEvent({
        type: "agent_start",
        agent: step.agent,
        phase: step.phase,
        timestamp: new Date().toISOString(),
      });
    }, agentDelay - 200);

    setTimeout(() => {
      callbacks.onEvent({
        type: "agent_complete",
        agent: step.agent,
        phase: step.phase,
        content: `${step.agent} analysis complete.`,
        timestamp: new Date().toISOString(),
      });
    }, agentDelay);
  });

  // Final result
  setTimeout(() => {
    const analysis = getMockAnalysis(ticker);
    callbacks.onEvent({
      type: "analysis_complete",
      data: analysis,
      timestamp: new Date().toISOString(),
    });
    callbacks.onComplete(analysis);
  }, cumDelay + 300);
}
