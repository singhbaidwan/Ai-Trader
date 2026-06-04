import { memo, useState, useEffect } from "react";
import type { RiskTone, Sentiment } from "@/types";

interface RiskScoreCardProps {
  riskScore: number;
  riskTone: RiskTone;
  sentiment: Sentiment;
}

const toneColorMap: Record<RiskTone, string> = {
  Low: "var(--green)",
  Moderate: "var(--amber)",
  High: "var(--red)",
};

const sentimentLabel: Record<Sentiment, { text: string; color: string }> = {
  Positive: { text: "Positive", color: "var(--green)" },
  Mixed: { text: "Mixed", color: "var(--amber)" },
  Negative: { text: "Negative", color: "var(--red)" },
};

/**
 * Derive rough sub-metric breakdowns from the aggregate risk score.
 * When real sub-scores are available, replace this heuristic.
 */
function deriveSubMetrics(riskScore: number, riskTone: RiskTone) {
  const base = riskScore;
  return {
    volatility: riskTone === "High" ? "High" : riskTone === "Moderate" ? "Moderate" : "Low",
    debtRisk: base > 65 ? "Elevated" : base > 35 ? "Moderate" : "Low",
    valuation: base > 70 ? "Stretched" : base > 40 ? "Fair" : "Cheap",
  };
}

export const RiskScoreCard = memo(function RiskScoreCard({
  riskScore,
  riskTone,
  sentiment,
}: RiskScoreCardProps) {
  const [mounted, setMounted] = useState(false);
  const toneColor = toneColorMap[riskTone];
  const sentCfg = sentimentLabel[sentiment];
  const sub = deriveSubMetrics(riskScore, riskTone);
  const clampedScore = Math.max(0, Math.min(100, riskScore));

  useEffect(() => {
    // Trigger on next frame so the conic-gradient animates from 0
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const gaugePercent = mounted ? `${clampedScore}%` : "0%";

  return (
    <div className="panel risk-card" aria-label="Risk Score panel">
      <h3>Risk Score</h3>

      <div className="risk-layout">
        {/* Left column — tone + metrics */}
        <div>
          <div
            style={{
              display: "inline-block",
              marginBottom: "14px",
              padding: "4px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: toneColor,
              fontSize: "14px",
              fontWeight: 680,
            }}
            role="status"
            aria-label={`Risk tone: ${riskTone}`}
          >
            {riskTone}
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <div className="metric">
              <span>Volatility</span>
              <strong>{sub.volatility}</strong>
            </div>
            <div className="metric">
              <span>Debt Risk</span>
              <strong>{sub.debtRisk}</strong>
            </div>
            <div className="metric">
              <span>Valuation</span>
              <strong>{sub.valuation}</strong>
            </div>
            <div className="metric">
              <span>Sentiment</span>
              <strong style={{ color: sentCfg.color }}>{sentCfg.text}</strong>
            </div>
          </div>
        </div>

        {/* Right column — donut gauge */}
        <div
          className="risk-gauge"
          role="meter"
          aria-label={`Risk score: ${clampedScore} out of 100`}
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          style={
            {
              "--score": gaugePercent,
              transition: "background 0.8s cubic-bezier(0.33, 1, 0.68, 1)",
            } as React.CSSProperties
          }
        >
          <strong>{clampedScore}</strong>
          <span>/ 100</span>
        </div>
      </div>
    </div>
  );
});
