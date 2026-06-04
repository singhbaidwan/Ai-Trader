import { useState } from 'react';
import { Star } from 'lucide-react';
import type { StockProfile } from '@/types';

/* ── Types ── */

interface QuoteCardProps {
  stock: StockProfile;
}

/* ── Metric helper ── */

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</strong>
    </div>
  );
}

/* ── Helpers ── */

function formatSigned(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

/* ── QuoteCard ── */

export function QuoteCard({ stock }: QuoteCardProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const isPositive = stock.changePercent >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';

  return (
    <article className="quote-card" aria-label={`${stock.ticker} stock quote`}>
      {/* ── Header: Company lockup + Watchlist button ── */}
      <div className="quote-header">
        <div className="company-lockup">
          <div className="ticker-mark" aria-hidden="true">
            {stock.ticker.charAt(0)}
          </div>
          <div>
            <h2>{stock.ticker}</h2>
            <p>{stock.name}</p>
            <small>
              {stock.exchange} · {stock.sector} · {stock.industry}
            </small>
          </div>
        </div>

        <button
          className="watch-button"
          type="button"
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          onClick={() => setInWatchlist((prev) => !prev)}
          style={
            inWatchlist
              ? { borderColor: 'var(--green)', color: 'var(--green)' }
              : undefined
          }
        >
          <Star
            className="icon"
            size={16}
            fill={inWatchlist ? 'var(--green)' : 'none'}
            stroke={inWatchlist ? 'var(--green)' : 'currentColor'}
          />
          {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
      </div>

      {/* ── Summary: Price + metrics row ── */}
      <div className="quote-summary">
        <div>
          <strong
            className="price"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {stock.price.toFixed(2)}
          </strong>
          <span
            className={changeClass}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatSigned(stock.change)} ({formatSigned(stock.changePercent)}%)
          </span>
          <small>As of local demo data</small>
        </div>

        <Metric label="Open" value={stock.open.toFixed(2)} />
        <Metric label="Day High" value={stock.high.toFixed(2)} />
        <Metric label="Day Low" value={stock.low.toFixed(2)} />
        <Metric label="Volume" value={stock.volume} />
        <Metric label="Avg Vol (10D)" value={stock.avgVolume} />
        <Metric label="P/E (TTM)" value={stock.peRatio.toFixed(2)} />
      </div>
    </article>
  );
}
