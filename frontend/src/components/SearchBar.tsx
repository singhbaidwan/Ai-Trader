import { FormEvent, useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

/* ── Types ── */

interface SearchBarProps {
  onAnalyze: (ticker: string) => void;
  isAnalyzing: boolean;
  defaultTicker?: string;
  currentPhase?: string;
  currentAgent?: string;
}

/* ── SearchBar ── */

export function SearchBar({
  onAnalyze,
  isAnalyzing,
  defaultTicker = '',
  currentPhase,
  currentAgent,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultTicker);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Sync when defaultTicker changes externally */
  useEffect(() => {
    if (defaultTicker) {
      setQuery(defaultTicker);
    }
  }, [defaultTicker]);

  /* Cmd+K / Ctrl+K keyboard shortcut to focus the input */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker || isAnalyzing) return;
    onAnalyze(ticker);
  }

  /* Build the button label */
  function renderButtonContent() {
    if (!isAnalyzing) return 'Analyze';

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Loader2
          size={16}
          style={{ animation: 'spin 1s linear infinite' }}
        />
        {currentPhase && currentAgent
          ? `${currentPhase} · ${currentAgent}`
          : currentPhase
            ? currentPhase
            : 'Analyzing…'}
      </span>
    );
  }

  return (
    <section className="search-section">
      <div>
        <h1>Stock intelligence</h1>
        <p>Search a ticker to assemble market, fundamentals, news, and risk context.</p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <label className="ticker-input">
          <Search size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <span className="sr-only">Stock ticker</span>
          <input
            ref={inputRef}
            type="text"
            autoCapitalize="characters"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter ticker, e.g. AAPL"
            aria-label="Stock ticker input"
          />
          <kbd
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--line)',
              background: 'var(--panel-strong)',
              color: 'var(--subtle)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            ⌘K
          </kbd>
        </label>

        <button
          className="analyze-button"
          type="submit"
          disabled={isAnalyzing || !query.trim()}
          aria-label={isAnalyzing ? 'Analyzing stock' : 'Analyze stock'}
        >
          {renderButtonContent()}
        </button>
      </form>
    </section>
  );
}
