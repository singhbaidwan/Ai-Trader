import { memo, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  MessageSquare,
  Newspaper,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Flame,
  Shield,
  Scale,
  Award,
  Gavel,
} from "lucide-react";
import type {
  InvestmentDebateState,
  RiskDebateState,
  DebateStep,
} from "@/types";

/* ── Props ──────────────────────────────────────────────── */

interface AgentDebateViewerProps {
  investmentDebate?: InvestmentDebateState;
  riskDebate?: RiskDebateState;
  debateTrace?: DebateStep[];
  isStreaming?: boolean;
  investmentPlan?: string;
  traderPlan?: string;
  finalDecision?: string;
}

/* ── Scoped style sheet (injected once) ─────────────────── */

const STYLE_ID = "debate-viewer-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
/* ── Debate viewer ─────────────────────────────────────── */
.debate-panel {
  padding: 0;
}

.debate-toggle {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  padding: 16px;
  font-size: 16px;
  font-weight: 680;
  cursor: pointer;
  transition: background 0.15s;
}
.debate-toggle:hover {
  background: rgba(255,255,255,0.03);
}

.debate-body {
  padding: 0 16px 20px;
}

/* timeline */
.debate-timeline {
  position: relative;
  padding-left: 24px;
}
.debate-timeline::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--line);
  border-radius: 2px;
}

/* phase label */
.debate-phase {
  position: relative;
  margin: 20px 0 10px;
  padding-left: 4px;
  color: var(--subtle);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.debate-phase::before {
  content: "";
  position: absolute;
  left: -21px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--line);
  border: 2px solid var(--panel);
}
.debate-phase:first-child {
  margin-top: 0;
}

/* agent card */
.debate-card {
  position: relative;
  margin-bottom: 8px;
  border: 1px solid var(--line-soft);
  border-left: 3px solid var(--card-accent, var(--line));
  border-radius: 6px;
  background: var(--panel-soft);
  padding: 12px 14px;
  animation: debateCardIn 0.35s ease-out both;
}
.debate-card::before {
  content: "";
  position: absolute;
  left: -28px;
  top: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--card-accent, var(--subtle));
  box-shadow: 0 0 0 3px var(--panel);
}

.debate-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 680;
  color: var(--card-accent, var(--text));
}
.debate-card-header svg {
  flex: 0 0 auto;
}

.debate-card-body {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

/* chat bubbles for bull / bear */
.debate-bubbles {
  display: grid;
  gap: 8px;
}
.debate-bubble {
  max-width: 85%;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.debate-bubble.left {
  justify-self: start;
  background: rgba(101,223,130,0.08);
  border: 1px solid rgba(101,223,130,0.15);
  border-bottom-left-radius: 2px;
  color: var(--text);
}
.debate-bubble.right {
  justify-self: end;
  background: rgba(255,101,101,0.08);
  border: 1px solid rgba(255,101,101,0.15);
  border-bottom-right-radius: 2px;
  color: var(--text);
}
.debate-bubble-name {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* verdict card */
.debate-verdict {
  border-color: var(--card-accent, var(--amber));
  background: linear-gradient(135deg, rgba(255,210,91,0.06), rgba(13,19,25,0.95));
}

/* show more */
.debate-expand-btn {
  border: 0;
  background: transparent;
  color: var(--green);
  font-size: 12px;
  font-weight: 650;
  padding: 4px 0;
  cursor: pointer;
}
.debate-expand-btn:hover {
  text-decoration: underline;
}

/* typing dots */
.debate-typing {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
}
.debate-typing span {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--subtle);
  animation: typingDot 1.4s ease-in-out infinite;
}
.debate-typing span:nth-child(2) { animation-delay: 0.2s; }
.debate-typing span:nth-child(3) { animation-delay: 0.4s; }

/* placeholder */
.debate-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--subtle);
  font-size: 14px;
}

@keyframes debateCardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes typingDot {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1); }
}
`;
  document.head.appendChild(style);
}

/* ── Helpers ────────────────────────────────────────────── */

const TRUNCATE_LEN = 280;

function TruncatedText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const needsTruncate = text.length > TRUNCATE_LEN;
  const display = expanded || !needsTruncate ? text : text.slice(0, TRUNCATE_LEN) + "…";

  return (
    <>
      <span>{display}</span>
      {needsTruncate && (
        <button
          className="debate-expand-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Show less" : "Show more"}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}

/* ── Agent card configs ────────────────────────────────── */

interface AgentMeta {
  icon: React.ReactNode;
  color: string;
  label: string;
}

const analysts: AgentMeta[] = [
  { icon: <BarChart3 size={16} />, color: "#5b9cf6", label: "Market Analyst" },
  { icon: <MessageSquare size={16} />, color: "#a78bfa", label: "Social Media Analyst" },
  { icon: <Newspaper size={16} />, color: "#5eead4", label: "News Analyst" },
  { icon: <FileText size={16} />, color: "#fb923c", label: "Fundamentals Analyst" },
];

/* ── Sub-components ─────────────────────────────────────── */

function AgentCard({
  meta,
  content,
  extraClass,
  animDelay,
}: {
  meta: AgentMeta;
  content: string;
  extraClass?: string;
  animDelay?: number;
}) {
  return (
    <div
      className={`debate-card ${extraClass ?? ""}`}
      style={
        {
          "--card-accent": meta.color,
          animationDelay: animDelay ? `${animDelay}ms` : undefined,
        } as React.CSSProperties
      }
    >
      <div className="debate-card-header">
        {meta.icon}
        {meta.label}
      </div>
      <div className="debate-card-body">
        <TruncatedText text={content} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="debate-typing" aria-label="Agent is thinking">
      <span />
      <span />
      <span />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export const AgentDebateViewer = memo(function AgentDebateViewer({
  investmentDebate,
  riskDebate,
  debateTrace,
  isStreaming = false,
  investmentPlan,
  traderPlan,
  finalDecision,
}: AgentDebateViewerProps) {
  ensureStyles();
  const [expanded, setExpanded] = useState(true);

  const hasData = !!(investmentDebate || riskDebate || (debateTrace && debateTrace.length > 0));

  /* Parse debate trace into phases for timeline rendering */
  const traceByRole = useMemo(() => {
    if (!debateTrace) return { analysts: [], bulls: [], bears: [], aggr: [], cons: [], neutral: [], other: [] };
    const out = { analysts: [] as DebateStep[], bulls: [] as DebateStep[], bears: [] as DebateStep[], aggr: [] as DebateStep[], cons: [] as DebateStep[], neutral: [] as DebateStep[], other: [] as DebateStep[] };
    for (const s of debateTrace) {
      switch (s.role) {
        case "analyst": out.analysts.push(s); break;
        case "bull": out.bulls.push(s); break;
        case "bear": out.bears.push(s); break;
        case "aggressive": out.aggr.push(s); break;
        case "conservative": out.cons.push(s); break;
        case "neutral": out.neutral.push(s); break;
        default: out.other.push(s); break;
      }
    }
    return out;
  }, [debateTrace]);

  /* Build investment debate bubbles from history or trace */
  const investmentBubbles = useMemo(() => {
    const bubbles: { side: "left" | "right"; name: string; text: string }[] = [];

    // Prefer debateTrace if available
    if (traceByRole.bulls.length || traceByRole.bears.length) {
      const maxLen = Math.max(traceByRole.bulls.length, traceByRole.bears.length);
      for (let i = 0; i < maxLen; i++) {
        if (traceByRole.bulls[i]) {
          bubbles.push({ side: "left", name: "Bull Researcher", text: traceByRole.bulls[i].content });
        }
        if (traceByRole.bears[i]) {
          bubbles.push({ side: "right", name: "Bear Researcher", text: traceByRole.bears[i].content });
        }
      }
    } else if (investmentDebate) {
      // Fallback: display raw history strings
      if (investmentDebate.bullHistory) {
        bubbles.push({ side: "left", name: "Bull Researcher", text: investmentDebate.bullHistory });
      }
      if (investmentDebate.bearHistory) {
        bubbles.push({ side: "right", name: "Bear Researcher", text: investmentDebate.bearHistory });
      }
    }

    return bubbles;
  }, [investmentDebate, traceByRole]);

  /* Build risk debate bubbles */
  const riskBubbles = useMemo(() => {
    const bubbles: { side: "left" | "right" | "center"; name: string; text: string; color: string }[] = [];

    if (traceByRole.aggr.length || traceByRole.cons.length || traceByRole.neutral.length) {
      const maxLen = Math.max(traceByRole.aggr.length, traceByRole.cons.length, traceByRole.neutral.length);
      for (let i = 0; i < maxLen; i++) {
        if (traceByRole.aggr[i]) bubbles.push({ side: "left", name: "Aggressive", text: traceByRole.aggr[i].content, color: "var(--red)" });
        if (traceByRole.cons[i]) bubbles.push({ side: "right", name: "Conservative", text: traceByRole.cons[i].content, color: "var(--green)" });
        if (traceByRole.neutral[i]) bubbles.push({ side: "center", name: "Neutral", text: traceByRole.neutral[i].content, color: "var(--amber)" });
      }
    } else if (riskDebate) {
      if (riskDebate.aggressiveHistory) bubbles.push({ side: "left", name: "Aggressive", text: riskDebate.aggressiveHistory, color: "var(--red)" });
      if (riskDebate.conservativeHistory) bubbles.push({ side: "right", name: "Conservative", text: riskDebate.conservativeHistory, color: "var(--green)" });
      if (riskDebate.neutralHistory) bubbles.push({ side: "center", name: "Neutral", text: riskDebate.neutralHistory, color: "var(--amber)" });
    }

    return bubbles;
  }, [riskDebate, traceByRole]);

  /* Analyst reports from debateTrace */
  const analystReports = useMemo(() => {
    return traceByRole.analysts.map((step, i) => ({
      meta: analysts[i] ?? { icon: <FileText size={16} />, color: "#a78bfa", label: step.agent },
      content: step.content,
    }));
  }, [traceByRole.analysts]);

  return (
    <div className="panel debate-panel" aria-label="Agent Analysis panel">
      <button
        className="debate-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label="Toggle agent analysis"
      >
        <span>Agent Analysis</span>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className="debate-body">
          {!hasData ? (
            <div className="debate-placeholder">
              Run an analysis to see the agent debate trace.
            </div>
          ) : (
            <div className="debate-timeline">
              {/* ── Phase 1: Data Gathering ────────────────── */}
              {analystReports.length > 0 && (
                <>
                  <div className="debate-phase">Phase 1 — Data Gathering</div>
                  {analystReports.map((r, i) => (
                    <AgentCard
                      key={`analyst-${i}`}
                      meta={r.meta}
                      content={r.content}
                      animDelay={i * 80}
                    />
                  ))}
                </>
              )}

              {/* ── Phase 2: Investment Debate ─────────────── */}
              {(investmentBubbles.length > 0 || investmentDebate?.judgeDecision || investmentPlan) && (
                <>
                  <div className="debate-phase">Phase 2 — Investment Debate</div>

                  {investmentBubbles.length > 0 && (
                    <div className="debate-card" style={{ "--card-accent": "var(--line)" } as React.CSSProperties}>
                      <div className="debate-bubbles">
                        {investmentBubbles.map((b, i) => (
                          <div key={`inv-b-${i}`} className={`debate-bubble ${b.side}`}>
                            <span
                              className="debate-bubble-name"
                              style={{ color: b.side === "left" ? "var(--green)" : "var(--red)" }}
                            >
                              {b.side === "left" ? <TrendingUp size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> : <TrendingDown size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}
                              {b.name}
                            </span>
                            <TruncatedText text={b.text} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Research Manager Verdict */}
                  {(investmentDebate?.judgeDecision || investmentPlan) && (
                    <AgentCard
                      meta={{ icon: <Gavel size={16} />, color: "#fbbf24", label: "Research Manager — Verdict" }}
                      content={investmentPlan ?? investmentDebate?.judgeDecision ?? ""}
                      extraClass="debate-verdict"
                    />
                  )}
                </>
              )}

              {/* ── Phase 3: Trading Decision ─────────────── */}
              {traderPlan && (
                <>
                  <div className="debate-phase">Phase 3 — Trading Decision</div>
                  <AgentCard
                    meta={{ icon: <DollarSign size={16} />, color: "#5b9cf6", label: "Trader" }}
                    content={traderPlan}
                  />
                </>
              )}

              {/* ── Phase 4: Risk Debate ───────────────────── */}
              {(riskBubbles.length > 0 || riskDebate?.judgeDecision || finalDecision) && (
                <>
                  <div className="debate-phase">Phase 4 — Risk Debate</div>

                  {riskBubbles.length > 0 && (
                    <div className="debate-card" style={{ "--card-accent": "var(--line)" } as React.CSSProperties}>
                      <div className="debate-bubbles">
                        {riskBubbles.map((b, i) => {
                          const sideClass = b.side === "center" ? "left" : b.side;
                          return (
                            <div
                              key={`risk-b-${i}`}
                              className={`debate-bubble ${sideClass}`}
                              style={
                                b.side === "center"
                                  ? {
                                      justifySelf: "center",
                                      background: "rgba(255,210,91,0.08)",
                                      borderColor: "rgba(255,210,91,0.15)",
                                    }
                                  : undefined
                              }
                            >
                              <span className="debate-bubble-name" style={{ color: b.color }}>
                                {b.side === "left" && <Flame size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}
                                {b.side === "right" && <Shield size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}
                                {b.side === "center" && <Scale size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}
                                {b.name}
                              </span>
                              <TruncatedText text={b.text} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Risk Judge */}
                  {(finalDecision || riskDebate?.judgeDecision) && (
                    <AgentCard
                      meta={{ icon: <Award size={16} />, color: "#a78bfa", label: "Risk Judge — Final Decision" }}
                      content={finalDecision ?? riskDebate?.judgeDecision ?? ""}
                      extraClass="debate-verdict"
                    />
                  )}
                </>
              )}

              {/* Streaming indicator */}
              {isStreaming && <TypingIndicator />}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
