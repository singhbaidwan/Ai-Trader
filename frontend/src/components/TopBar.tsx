import { Bell, HelpCircle, User } from 'lucide-react';

/* ── Market index data (static demo) ── */

interface MarketIndex {
  name: string;
  value: string;
  change: string;
  positive: boolean;
}

const indices: MarketIndex[] = [
  { name: 'S&P 500', value: '5,304.72', change: '+0.39%', positive: true },
  { name: 'NASDAQ',  value: '16,920.58', change: '+0.65%', positive: true },
  { name: 'VIX',     value: '12.41',     change: '-1.03%', positive: false },
];

/* ── Tab config ── */

const tabs = ['Research', 'Signals', 'Watchlist'] as const;

/* ── Shared icon button style ── */

const iconBtnStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 36,
  height: 36,
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--muted)',
  cursor: 'pointer',
};

/* ── TopBar ── */

export function TopBar() {
  return (
    <header className="topbar">
      {/* Left: Tab navigation */}
      <nav className="tabs" aria-label="Primary navigation">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === 'Research' ? 'selected' : ''}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Right: Market strip + utility icons */}
      <div className="market-strip" aria-label="Market status">
        {indices.map((idx) => (
          <span key={idx.name}>
            {idx.name}
            <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {idx.value}
            </strong>
            <em className={idx.positive ? '' : 'negative'}>
              {idx.change}
            </em>
          </span>
        ))}

        <button type="button" aria-label="Notifications" style={iconBtnStyle}>
          <Bell size={18} />
        </button>
        <button type="button" aria-label="Help" style={iconBtnStyle}>
          <HelpCircle size={18} />
        </button>
        <button type="button" aria-label="User menu" style={iconBtnStyle}>
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
