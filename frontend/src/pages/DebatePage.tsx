import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { AgentDebateViewer } from "@/components/AgentDebateViewer";
import { useAnalysis } from "@/lib/hooks";

export function DebatePage() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const {
    analysis,
    isAnalyzing,
    startAnalysis,
  } = useAnalysis();

  const displayTicker = ticker?.toUpperCase() ?? "—";
  const hasData = !!analysis && analysis.ticker === displayTicker;

  return (
    <section
      className="animate-in"
      style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <button
          className="ghost-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>
            Agent Debate — {displayTicker}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
            Full multi-agent analysis and debate trace
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      {hasData || isAnalyzing ? (
        <AgentDebateViewer
          investmentDebate={analysis?.investmentDebate}
          riskDebate={analysis?.riskDebate}
          debateTrace={analysis?.debateTrace}
          isStreaming={isAnalyzing}
          investmentPlan={analysis?.investmentPlan}
          traderPlan={analysis?.traderPlan}
          finalDecision={analysis?.finalDecision}
        />
      ) : (
        <div
          className="panel"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            gap: 16,
            textAlign: "center",
          }}
        >
          <Search
            size={40}
            style={{ color: "var(--subtle)", opacity: 0.5 }}
          />
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 380 }}>
            No analysis data available for <strong>{displayTicker}</strong>.
          </p>
          <p style={{ color: "var(--subtle)", fontSize: 13 }}>
            Go to the Research page and run an analysis first, or click below
            to start one now.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              className="ghost-button"
              onClick={() => navigate(`/?ticker=${displayTicker}`)}
              style={{ padding: "8px 18px" }}
            >
              Open in Research
            </button>
            <button
              className="analyze-button"
              onClick={() => ticker && startAnalysis(ticker)}
              disabled={isAnalyzing || !ticker}
              style={{ padding: "8px 18px" }}
            >
              {isAnalyzing ? "Analyzing…" : "Analyze Now"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
