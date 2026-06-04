import { memo } from "react";
import {
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { Signal } from "@/types";

interface AiSignalCardProps {
  signal: Signal;
  confidence: number;
  aiScore: number;
  timeHorizon?: string;
}

const signalConfig: Record<
  Signal,
  { className: string; icon: React.ReactNode; label: string }
> = {
  Bullish: {
    className: "bullish",
    icon: <TrendingUp size={28} />,
    label: "Bullish",
  },
  Neutral: {
    className: "neutral",
    icon: <Minus size={28} />,
    label: "Neutral",
  },
  Bearish: {
    className: "bearish",
    icon: <TrendingDown size={28} />,
    label: "Bearish",
  },
};

export const AiSignalCard = memo(function AiSignalCard({
  signal,
  confidence,
  aiScore,
  timeHorizon = "1-3 Months",
}: AiSignalCardProps) {
  const cfg = signalConfig[signal];
  const clampedScore = Math.max(0, Math.min(100, aiScore));

  return (
    <div className="panel signal-card" aria-label="AI Signal panel">
      <div className="panel-header">
        <h3>AI Signal</h3>
        <Info size={16} className="icon" style={{ color: "var(--subtle)" }} aria-label="Signal info" />
      </div>

      <div className={`signal ${cfg.className}`} role="status" aria-label={`Signal: ${cfg.label}`}>
        {cfg.icon}
        <span>{cfg.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div className="metric">
          <span>Confidence</span>
          <strong>{confidence}%</strong>
        </div>

        <div className="metric">
          <span>Time Horizon</span>
          <strong>{timeHorizon}</strong>
        </div>

        <div className="metric">
          <span>AI Score</span>
          <strong>
            {aiScore}{" "}
            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "12px" }}>
              / 100
            </span>
          </strong>
        </div>
      </div>

      <div
        className="score-track"
        role="meter"
        aria-label="AI Score meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${clampedScore}%` }} />
      </div>
    </div>
  );
});
