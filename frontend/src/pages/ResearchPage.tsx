import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { QuoteCard } from "@/components/QuoteCard";
import { PriceChart } from "@/components/PriceChart";
import { FundamentalsTable } from "@/components/FundamentalsTable";
import { CompanyInfo } from "@/components/CompanyInfo";
import { AiSignalCard } from "@/components/AiSignalCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { NewsPanel } from "@/components/NewsPanel";
import { AgentDebateViewer } from "@/components/AgentDebateViewer";
import {
  QuoteCardSkeleton,
  ChartSkeleton,
  PanelSkeleton,
} from "@/components/LoadingSkeleton";
import { useQuote, useAnalysis } from "@/lib/hooks";
import { getStockProfile } from "@/data/stocks";
import type { Signal } from "@/types";

export function ResearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tickerParam = searchParams.get("ticker");

  const [selectedTicker, setSelectedTicker] = useState(
    tickerParam?.toUpperCase() || "AAPL"
  );
  const [selectedRange, setSelectedRange] = useState("1D");

  // Sync from URL on mount / navigation
  useEffect(() => {
    if (tickerParam && tickerParam.toUpperCase() !== selectedTicker) {
      setSelectedTicker(tickerParam.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerParam]);

  // Hooks
  const { stock, isLoading: quoteLoading } = useQuote(selectedTicker);
  const {
    analysis,
    isAnalyzing,
    streamEvents,
    currentPhase,
    currentAgent,
    startAnalysis,
    cancelAnalysis,
  } = useAnalysis();

  const isPositive = stock.changePercent >= 0;

  // Analyze handler
  const onAnalyze = useCallback(
    (ticker: string) => {
      const upper = ticker.toUpperCase();
      setSelectedTicker(upper);
      setSearchParams({ ticker: upper });
      startAnalysis(upper);
    },
    [setSearchParams, startAnalysis]
  );

  // Fundamentals data
  const fundamentals: Array<[string, string | number]> = useMemo(
    () => [
      ["Market Cap", stock.marketCap],
      ["Enterprise Value", stock.enterpriseValue],
      ["Revenue", stock.revenue],
      ["Gross Margin", stock.grossMargin],
      ["Operating Margin", stock.operatingMargin],
      ["Net Margin", stock.netMargin],
      ["P/E Ratio", stock.peRatio],
      ["Forward P/E", stock.forwardPe],
      ["PEG Ratio", stock.pegRatio],
      ["Price / Sales", stock.priceSales],
      ["ROE", stock.roe],
      ["Debt / Equity", stock.debtEquity],
    ],
    [stock]
  );

  const earnings: Array<[string, string | number]> = useMemo(
    () => [
      ["Next Earnings", stock.nextEarnings],
      ["EPS Estimate", stock.epsEstimate],
      ["EPS (TTM)", stock.epsTtm],
      ["Revenue Estimate", stock.revenueEstimate],
      ["Signal Confidence", `${stock.confidence}%`],
      ["Dividend Yield", stock.dividendYield],
    ],
    [stock]
  );

  // Derive signal / risk from analysis if available
  const displaySignal: Signal = analysis
    ? analysis.signal === "BUY"
      ? "Bullish"
      : analysis.signal === "SELL"
        ? "Bearish"
        : "Neutral"
    : stock.signal;

  const displayConfidence = analysis?.confidence ?? stock.confidence;
  const displayAiScore = analysis?.aiScore ?? stock.aiScore;
  const displayRiskScore = analysis?.riskScore ?? stock.riskScore;
  const displayRiskTone = analysis?.riskTone ?? stock.riskTone;
  const displaySentiment = analysis?.sentiment ?? stock.sentiment;

  return (
    <>
      {/* ── Search ── */}
      <SearchBar
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
        defaultTicker={selectedTicker}
        currentPhase={currentPhase}
        currentAgent={currentAgent}
      />

      {/* ── Content Grid ── */}
      <div className="content-grid">
        {/* ── Center Column ── */}
        <section className="center-column stagger">
          {quoteLoading ? (
            <QuoteCardSkeleton />
          ) : (
            <QuoteCard stock={stock} />
          )}

          {quoteLoading ? (
            <ChartSkeleton />
          ) : (
            <PriceChart
              data={stock.chart}
              positive={isPositive}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
            />
          )}

          <div className="lower-grid">
            <FundamentalsTable
              title="Key Fundamentals (TTM)"
              rows={fundamentals}
            />
            <FundamentalsTable title="Earnings" rows={earnings} />
          </div>

          {/* Agent Debate Viewer — show when analysis exists or streaming */}
          {(analysis || isAnalyzing) && (
            <AgentDebateViewer
              investmentDebate={analysis?.investmentDebate}
              riskDebate={analysis?.riskDebate}
              debateTrace={analysis?.debateTrace}
              isStreaming={isAnalyzing}
              investmentPlan={analysis?.investmentPlan}
              traderPlan={analysis?.traderPlan}
              finalDecision={analysis?.finalDecision}
            />
          )}
        </section>

        {/* ── Insight Rail ── */}
        <aside className="insight-rail stagger" aria-label="Stock insights">
          <AiSignalCard
            signal={displaySignal}
            confidence={displayConfidence}
            aiScore={displayAiScore}
          />

          <RiskScoreCard
            riskScore={displayRiskScore}
            riskTone={displayRiskTone}
            sentiment={displaySentiment}
          />

          <CompanyInfo stock={stock} />

          <NewsPanel news={stock.news} companyName={stock.name} />
        </aside>
      </div>
    </>
  );
}
