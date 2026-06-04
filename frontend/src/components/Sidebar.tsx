import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  BarChart3,
  SlidersHorizontal,
  Calendar,
  Newspaper,
  Bell,
  Briefcase,
  Settings,
  Plus,
} from 'lucide-react';
import { watchlistTickers, getStockProfile } from '@/data/stocks';

/* ── Navigation config ── */

interface NavEntry {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavEntry[] = [
  { label: 'Overview',  path: '/',          icon: <LayoutDashboard className="icon" /> },
  { label: 'Market',    path: '/market',    icon: <BarChart3 className="icon" /> },
  { label: 'Screener',  path: '/screener',  icon: <SlidersHorizontal className="icon" /> },
  { label: 'Calendar',  path: '/calendar',  icon: <Calendar className="icon" /> },
  { label: 'News',      path: '/news',      icon: <Newspaper className="icon" /> },
  { label: 'Alerts',    path: '/alerts',    icon: <Bell className="icon" /> },
  { label: 'Portfolio', path: '/portfolio', icon: <Briefcase className="icon" /> },
  { label: 'Settings',  path: '/settings',  icon: <Settings className="icon" /> },
];

/* ── Sparkline (inline SVG) ── */

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 86;
      const y = 28 - ((v - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" viewBox="0 0 86 32" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#65df82' : '#ff6565'}
        strokeWidth="2"
      />
    </svg>
  );
}

/* ── Helpers ── */

function formatSigned(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

/* ── Sidebar ── */

export function Sidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTicker = searchParams.get('ticker') ?? '';

  function handleTickerClick(ticker: string) {
    navigate(`/?ticker=${ticker}`);
  }

  return (
    <aside className="sidebar" aria-label="AiTrader navigation">
      {/* Brand */}
      <div className="brand">
        <TrendingUp className="icon" />
        <span>AiTrader</span>
      </div>

      {/* Navigation */}
      <nav className="nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 40,
              borderRadius: 6,
              padding: '0 13px',
              color: 'var(--text)',
              textAlign: 'left',
              border: 0,
              background: 'transparent',
              textDecoration: 'none',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Watchlist */}
      <section className="watchlist" aria-label="Watchlist">
        <div className="section-title">
          <span>My Watchlist</span>
          <button aria-label="Add symbol" type="button">
            <Plus size={16} />
          </button>
        </div>

        {watchlistTickers.map((ticker) => {
          const stock = getStockProfile(ticker);
          const positive = stock.changePercent >= 0;
          const selected = ticker === activeTicker;

          return (
            <button
              key={ticker}
              className={`watch-row${selected ? ' selected' : ''}`}
              onClick={() => handleTickerClick(ticker)}
              type="button"
              aria-label={`${stock.ticker} – ${stock.name}, ${formatSigned(stock.changePercent)}%`}
            >
              <span>
                <strong>{stock.ticker}</strong>
                <small>{stock.name}</small>
              </span>
              <Sparkline values={stock.sparkline} positive={positive} />
              <span className="watch-price">
                <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {stock.price.toFixed(2)}
                </strong>
                <small className={positive ? 'positive' : 'negative'}>
                  {formatSigned(stock.changePercent)}%
                </small>
              </span>
            </button>
          );
        })}
      </section>

      {/* Footer note */}
      <p className="data-note">
        Market data shown locally for UI research. Connect a live API for production quotes.
      </p>
    </aside>
  );
}
