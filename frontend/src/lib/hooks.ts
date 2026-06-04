/* ──────────────────────────────────────────────────────────
   AiTrader — Custom React Hooks
   State management and data fetching hooks
   ────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentAnalysis,
  StreamEvent,
  StockProfile,
  WatchlistItem,
} from "@/types";
import { getStockProfile } from "@/data/stocks";
import {
  fetchQuote,
  streamAnalysis,
  analyzeStock,
  checkHealth,
} from "@/lib/api";

// ── useQuote: Fetches stock quote data ──

interface UseQuoteResult {
  stock: StockProfile;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuote(ticker: string): UseQuoteResult {
  const [stock, setStock] = useState<StockProfile>(() =>
    getStockProfile(ticker)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!ticker) return;
    setIsLoading(true);
    setError(null);

    try {
      const quote = await fetchQuote(ticker);
      // Merge API response with local profile for any missing fields
      const localProfile = getStockProfile(ticker);
      setStock({
        ...localProfile,
        ...quote,
        // Ensure these always come from profile (chart data not in API)
        chart: localProfile.chart,
        sparkline: localProfile.sparkline,
        news: localProfile.news,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch quote");
      setStock(getStockProfile(ticker));
    } finally {
      setIsLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stock, isLoading, error, refetch: fetchData };
}

// ── useAnalysis: Triggers and tracks agent analysis ──

interface UseAnalysisResult {
  analysis: AgentAnalysis | null;
  isAnalyzing: boolean;
  streamEvents: StreamEvent[];
  currentPhase: string;
  currentAgent: string;
  error: string | null;
  startAnalysis: (ticker: string) => void;
  cancelAnalysis: () => void;
}

export function useAnalysis(): UseAnalysisResult {
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [currentPhase, setCurrentPhase] = useState("");
  const [currentAgent, setCurrentAgent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const startAnalysis = useCallback(async (ticker: string) => {
    // Cancel any running analysis
    cancelRef.current?.();

    setIsAnalyzing(true);
    setAnalysis(null);
    setStreamEvents([]);
    setCurrentPhase("");
    setCurrentAgent("");
    setError(null);

    // Check if backend is available
    const backendAvailable = await checkHealth();

    if (backendAvailable) {
      // Try SSE streaming first
      const cancel = streamAnalysis(ticker, {
        onEvent: (event) => {
          setStreamEvents((prev) => [...prev, event]);
          if (event.phase) setCurrentPhase(event.phase);
          if (event.agent) setCurrentAgent(event.agent);
        },
        onComplete: (result) => {
          setAnalysis(result);
          setIsAnalyzing(false);
          setCurrentPhase("Complete");
          setCurrentAgent("");
        },
        onError: (err) => {
          setError(err.message);
          setIsAnalyzing(false);
        },
      });
      cancelRef.current = cancel;
    } else {
      // Fallback: mock streaming simulation
      const cancel = streamAnalysis(ticker, {
        onEvent: (event) => {
          setStreamEvents((prev) => [...prev, event]);
          if (event.phase) setCurrentPhase(event.phase);
          if (event.agent) setCurrentAgent(event.agent);
        },
        onComplete: (result) => {
          setAnalysis(result);
          setIsAnalyzing(false);
          setCurrentPhase("Complete");
          setCurrentAgent("");
        },
        onError: async () => {
          // Last resort: blocking call with mock
          try {
            const result = await analyzeStock(ticker);
            setAnalysis(result);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Analysis failed"
            );
          }
          setIsAnalyzing(false);
        },
      });
      cancelRef.current = cancel;
    }
  }, []);

  const cancelAnalysis = useCallback(() => {
    cancelRef.current?.();
    setIsAnalyzing(false);
    setCurrentPhase("");
    setCurrentAgent("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current?.();
    };
  }, []);

  return {
    analysis,
    isAnalyzing,
    streamEvents,
    currentPhase,
    currentAgent,
    error,
    startAnalysis,
    cancelAnalysis,
  };
}

// ── useWatchlist: Persisted watchlist management ──

const WATCHLIST_KEY = "aitrader_watchlist";
const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { ticker: "AAPL", addedAt: "2024-01-01" },
  { ticker: "MSFT", addedAt: "2024-01-01" },
  { ticker: "TSLA", addedAt: "2024-01-01" },
  { ticker: "NVDA", addedAt: "2024-01-01" },
];

interface UseWatchlistResult {
  watchlist: WatchlistItem[];
  tickers: string[];
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  toggleTicker: (ticker: string) => void;
}

export function useWatchlist(): UseWatchlistResult {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const tickers = watchlist.map((item) => item.ticker);

  const addTicker = useCallback((ticker: string) => {
    const upper = ticker.toUpperCase();
    setWatchlist((prev) => {
      if (prev.some((item) => item.ticker === upper)) return prev;
      return [...prev, { ticker: upper, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeTicker = useCallback((ticker: string) => {
    const upper = ticker.toUpperCase();
    setWatchlist((prev) => prev.filter((item) => item.ticker !== upper));
  }, []);

  const isInWatchlist = useCallback(
    (ticker: string) => {
      return tickers.includes(ticker.toUpperCase());
    },
    [tickers]
  );

  const toggleTicker = useCallback(
    (ticker: string) => {
      if (isInWatchlist(ticker)) {
        removeTicker(ticker);
      } else {
        addTicker(ticker);
      }
    },
    [isInWatchlist, addTicker, removeTicker]
  );

  return {
    watchlist,
    tickers,
    addTicker,
    removeTicker,
    isInWatchlist,
    toggleTicker,
  };
}

// ── useBackendStatus: Monitors backend availability ──

export function useBackendStatus(): { isOnline: boolean; checking: boolean } {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      setChecking(true);
      const online = await checkHealth();
      if (mounted) {
        setIsOnline(online);
        setChecking(false);
      }
    }

    check();
    // Re-check every 30s
    const interval = setInterval(check, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isOnline, checking };
}

// ── useKeyboardShortcut ──

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  meta = true
): void {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, meta]);
}
