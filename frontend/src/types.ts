/* ──────────────────────────────────────────────────────────
   AiTrader — Shared type definitions
   Maps Python agent output → frontend display models
   ────────────────────────────────────────────────────────── */

// ── Signals & Enums ──

export type Signal = "Bullish" | "Neutral" | "Bearish";
export type TradeAction = "BUY" | "SELL" | "HOLD";
export type RiskTone = "Low" | "Moderate" | "High";
export type Sentiment = "Positive" | "Mixed" | "Negative";

// ── Agent Debate Types (maps to backend agent_states.py) ──

export interface DebateStep {
  agent: string;
  role: "bull" | "bear" | "aggressive" | "conservative" | "neutral" | "manager" | "trader" | "analyst";
  content: string;
  timestamp: string;
}

export interface InvestmentDebateState {
  bullHistory: string;
  bearHistory: string;
  history: string;
  currentResponse: string;
  judgeDecision: string;
  count: number;
}

export interface RiskDebateState {
  aggressiveHistory: string;
  conservativeHistory: string;
  neutralHistory: string;
  history: string;
  judgeDecision: string;
  count: number;
}

// ── Agent Analysis Result (full pipeline output) ──

export interface AgentAnalysis {
  ticker: string;
  tradeDate: string;
  signal: TradeAction;
  confidence: number;
  aiScore: number;
  riskScore: number;
  riskTone: RiskTone;
  sentiment: Sentiment;

  // Phase 1: Analyst reports
  marketReport: string;
  sentimentReport: string;
  newsReport: string;
  fundamentalsReport: string;

  // Phase 2: Investment debate
  investmentDebate: InvestmentDebateState;
  investmentPlan: string;

  // Phase 3: Trader decision
  traderPlan: string;

  // Phase 4: Risk debate + final decision
  riskDebate: RiskDebateState;
  finalDecision: string;

  // Streaming progress
  debateTrace: DebateStep[];
  timestamp: string;
}

// ── SSE Streaming Events ──

export type StreamEventType =
  | "phase_start"
  | "agent_start"
  | "agent_complete"
  | "debate_turn"
  | "analysis_complete"
  | "error";

export interface StreamEvent {
  type: StreamEventType;
  agent?: string;
  phase?: string;
  content?: string;
  data?: Partial<AgentAnalysis>;
  timestamp: string;
}

// ── Stock / Quote Data (display model) ──

export interface StockProfile {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  avgVolume: string;
  marketCap: string;
  enterpriseValue: string;
  peRatio: number;
  forwardPe: number;
  pegRatio: number;
  priceSales: number;
  dividendYield: string;
  revenue: string;
  grossMargin: string;
  operatingMargin: string;
  netMargin: string;
  roe: string;
  debtEquity: string;
  nextEarnings: string;
  epsEstimate: string;
  epsTtm: string;
  revenueEstimate: string;
  signal: Signal;
  confidence: number;
  aiScore: number;
  riskScore: number;
  riskTone: RiskTone;
  sentiment: Sentiment;
  ceo: string;
  employees: string;
  headquarters: string;
  ipo: string;
  website: string;
  about: string;
  chart: number[];
  sparkline: number[];
  news: NewsItem[];
}

export interface NewsItem {
  title: string;
  source: string;
  time: string;
  url?: string;
}

// ── API Response Wrappers ──

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Settings / Config ──

export type LLMProvider = "google" | "ollama" | "local";

export interface AppConfig {
  llmProvider: LLMProvider;
  modelName: string;
  baseUrl: string;
  apiKey: string;
  maxDebateRounds: number;
  maxRiskRounds: number;
  dataVendors: {
    coreStockApis: string;
    technicalIndicators: string;
    fundamentalData: string;
    newsData: string;
  };
}

// ── Watchlist ──

export interface WatchlistItem {
  ticker: string;
  addedAt: string;
}
