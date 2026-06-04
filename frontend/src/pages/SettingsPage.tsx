import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Server } from "lucide-react";
import { useBackendStatus } from "@/lib/hooks";
import { fetchConfig, updateConfig } from "@/lib/api";
import type { LLMProvider, AppConfig } from "@/types";

const LLM_PROVIDERS: { value: LLMProvider; label: string }[] = [
  { value: "google", label: "Google (Gemini)" },
  { value: "ollama", label: "Ollama" },
  { value: "local", label: "Local / Custom" },
];

const DATA_VENDOR_OPTIONS = ["yfinance", "alpha_vantage"];

const defaultConfig: AppConfig = {
  llmProvider: "local",
  modelName: "llama3.2:3b",
  baseUrl: "http://127.0.0.1:11434/v1",
  apiKey: "",
  maxDebateRounds: 1,
  maxRiskRounds: 1,
  dataVendors: {
    coreStockApis: "yfinance",
    technicalIndicators: "yfinance",
    fundamentalData: "yfinance",
    newsData: "yfinance",
  },
};

export function SettingsPage() {
  const { isOnline, checking } = useBackendStatus();
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load config from backend on mount
  useEffect(() => {
    async function load() {
      const remote = await fetchConfig();
      if (remote) {
        setConfig((prev) => ({ ...prev, ...remote }));
      }
    }
    load();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateConfig({
        llm_provider: config.llmProvider,
        deep_think_llm: config.modelName,
        quick_think_llm: config.modelName,
        backend_url: config.baseUrl,
        local_api_key: config.apiKey,
        max_debate_rounds: config.maxDebateRounds,
        max_risk_discuss_rounds: config.maxRiskRounds,
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Silently fail — the backend may not be running
    } finally {
      setSaving(false);
    }
  }, [config]);

  function updateField<K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateVendor(
    key: keyof AppConfig["dataVendors"],
    value: string
  ) {
    setConfig((prev) => ({
      ...prev,
      dataVendors: { ...prev.dataVendors, [key]: value },
    }));
  }

  return (
    <section
      className="animate-in"
      style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            Configure your AI pipeline and data sources.
          </p>
        </div>

        {/* Backend status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <Server size={14} />
          Backend
          {checking ? (
            <span
              className="status-dot"
              style={{ background: "var(--amber)", opacity: 0.6 }}
            />
          ) : (
            <span
              className={`status-dot ${isOnline ? "online" : "offline"}`}
            />
          )}
          <span style={{ color: isOnline ? "var(--green)" : "var(--red)" }}>
            {checking ? "Checking…" : isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* ── LLM Provider ── */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>LLM Provider</h3>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          {LLM_PROVIDERS.map((p) => (
            <label
              key={p.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 14,
                color:
                  config.llmProvider === p.value
                    ? "var(--green)"
                    : "var(--text)",
              }}
            >
              <input
                type="radio"
                name="llm-provider"
                value={p.value}
                checked={config.llmProvider === p.value}
                onChange={() => updateField("llmProvider", p.value)}
                style={{ accentColor: "var(--green)" }}
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Model Configuration ── */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>Model Configuration</h3>
        <div
          style={{
            display: "grid",
            gap: 14,
            marginTop: 12,
          }}
        >
          <SettingsField label="Model Name">
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => updateField("modelName", e.target.value)}
              placeholder="e.g. llama3.2:3b"
              className="settings-input"
            />
          </SettingsField>

          <SettingsField label="Base URL">
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => updateField("baseUrl", e.target.value)}
              placeholder="http://127.0.0.1:11434/v1"
              className="settings-input"
            />
          </SettingsField>

          <SettingsField label="API Key">
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => updateField("apiKey", e.target.value)}
              placeholder="Enter API key (optional)"
              className="settings-input"
            />
          </SettingsField>
        </div>
      </div>

      {/* ── Debate Rounds ── */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>Debate Rounds</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 12,
          }}
        >
          <SettingsField label="Investment Debate Rounds">
            <input
              type="number"
              min={1}
              max={10}
              value={config.maxDebateRounds}
              onChange={(e) =>
                updateField("maxDebateRounds", Number(e.target.value) || 1)
              }
              className="settings-input"
            />
          </SettingsField>

          <SettingsField label="Risk Discussion Rounds">
            <input
              type="number"
              min={1}
              max={10}
              value={config.maxRiskRounds}
              onChange={(e) =>
                updateField("maxRiskRounds", Number(e.target.value) || 1)
              }
              className="settings-input"
            />
          </SettingsField>
        </div>
      </div>

      {/* ── Data Vendors ── */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <h3>Data Vendors</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 12,
          }}
        >
          {(
            [
              ["coreStockApis", "Core Stock APIs"],
              ["technicalIndicators", "Technical Indicators"],
              ["fundamentalData", "Fundamental Data"],
              ["newsData", "News Data"],
            ] as const
          ).map(([key, label]) => (
            <SettingsField key={key} label={label}>
              <select
                value={config.dataVendors[key]}
                onChange={(e) => updateVendor(key, e.target.value)}
                className="settings-input"
              >
                {DATA_VENDOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </SettingsField>
          ))}
        </div>
      </div>

      {/* ── Save Button ── */}
      <button
        className="analyze-button"
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {saving ? (
          <>
            <Loader2 size={16} className="spinner" />
            Saving…
          </>
        ) : saved ? (
          <>
            <Save size={16} />
            Saved!
          </>
        ) : (
          <>
            <Save size={16} />
            Save Configuration
          </>
        )}
      </button>

      {/* Scoped styles for settings form elements */}
      <style>{`
        .settings-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: var(--panel-strong);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .settings-input:focus {
          outline: none;
          border-color: var(--green);
        }
        .settings-input::placeholder {
          color: var(--subtle);
        }
        select.settings-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a7b0b6' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
      `}</style>
    </section>
  );
}

/* ── Helper ── */

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--muted)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
