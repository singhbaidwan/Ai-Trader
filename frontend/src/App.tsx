import { FormEvent, useMemo, useState } from "react";
import { getStockProfile, watchlistTickers } from "./data/stocks";

const navItems = ["Overview", "Market", "Screener", "Calendar", "News", "Alerts", "Portfolio", "Settings"];
const ranges = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y", "MAX"];

function Icon({ name }: { name: "trend" | "search" | "star" | "bell" | "grid" | "plus" }) {
  const paths = {
    trend: "M3 17l6-6 4 4L21 5m0 0v7m0-7h-7",
    search: "M11 19a8 8 0 1 1 5.66-13.66A8 8 0 0 1 11 19Zm6-2 4 4",
    star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z",
    bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
    grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
    plus: "M12 5v14M5 12h14"
  };

  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none">
      <path d={paths[name]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

function MiniLine({ values, positive }: { values: number[]; positive: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 86;
      const y = 28 - ((value - min) / Math.max(max - min, 1)) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 86 32" aria-hidden="true">
      <polyline points={points} fill="none" stroke={positive ? "#65df82" : "#ff6565"} strokeWidth="2" />
    </svg>
  );
}

function PriceChart({ values, positive }: { values: number[]; positive: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 760;
  const height = 250;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / Math.max(max - min, 1)) * (height - 22) - 10;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="chart-frame" aria-label="Intraday price chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={positive ? "#65df82" : "#ff6565"} stopOpacity="0.28" />
            <stop offset="100%" stopColor={positive ? "#65df82" : "#ff6565"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid-lines">
          {[40, 90, 140, 190, 240].map((y) => (
            <line key={y} x1="0" x2={width} y1={y} y2={y} />
          ))}
        </g>
        <polygon points={area} fill="url(#chartFill)" />
        <polyline points={points} fill="none" stroke={positive ? "#65df82" : "#ff6565"} strokeWidth="3" />
      </svg>
      <div className="time-axis">
        <span>9:30 AM</span>
        <span>10:30 AM</span>
        <span>11:30 AM</span>
        <span>12:30 PM</span>
        <span>1:30 PM</span>
        <span>4:00 PM</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataTable({ rows }: { rows: Array<[string, string | number]> }) {
  return (
    <div className="data-table">
      {rows.map(([label, value]) => (
        <div className="data-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function App() {
  const [query, setQuery] = useState("AAPL");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [selectedRange, setSelectedRange] = useState("1D");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const stock = useMemo(() => getStockProfile(selectedTicker), [selectedTicker]);
  const isPositive = stock.changePercent >= 0;

  function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTicker = query.trim().toUpperCase();
    if (!nextTicker) return;
    setIsAnalyzing(true);
    window.setTimeout(() => {
      setSelectedTicker(nextTicker);
      setIsAnalyzing(false);
    }, 450);
  }

  const fundamentals: Array<[string, string | number]> = [
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
    ["Debt / Equity", stock.debtEquity]
  ];

  const earnings: Array<[string, string | number]> = [
    ["Next Earnings", stock.nextEarnings],
    ["EPS Estimate", stock.epsEstimate],
    ["EPS (TTM)", stock.epsTtm],
    ["Revenue Estimate", stock.revenueEstimate],
    ["Signal Confidence", `${stock.confidence}%`],
    ["Dividend Yield", stock.dividendYield]
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="AiTrader navigation">
        <div className="brand">
          <Icon name="trend" />
          <span>AiTrader</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item, index) => (
            <button className={index === 0 ? "active" : ""} key={item} type="button">
              <Icon name={index === 0 ? "grid" : "trend"} />
              {item}
            </button>
          ))}
        </nav>
        <section className="watchlist" aria-label="Watchlist">
          <div className="section-title">
            <span>My Watchlist</span>
            <button aria-label="Add symbol" type="button">
              <Icon name="plus" />
            </button>
          </div>
          {watchlistTickers.map((ticker) => {
            const item = getStockProfile(ticker);
            const active = item.ticker === stock.ticker;
            return (
              <button
                className={`watch-row ${active ? "selected" : ""}`}
                key={item.ticker}
                onClick={() => {
                  setQuery(item.ticker);
                  setSelectedTicker(item.ticker);
                }}
                type="button"
              >
                <span>
                  <strong>{item.ticker}</strong>
                  <small>{item.name}</small>
                </span>
                <MiniLine values={item.sparkline} positive={item.changePercent >= 0} />
                <span className="watch-price">
                  <strong>{item.price.toFixed(2)}</strong>
                  <small className={item.changePercent >= 0 ? "positive" : "negative"}>
                    {formatSigned(item.changePercent)}%
                  </small>
                </span>
              </button>
            );
          })}
        </section>
        <p className="data-note">Market data shown locally for UI research. Connect a live API for production quotes.</p>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="tabs" aria-label="Primary navigation">
            <button className="selected" type="button">Research</button>
            <button type="button">Signals</button>
            <button type="button">Watchlist</button>
          </div>
          <div className="market-strip" aria-label="Market status">
            <span>S&P 500 <strong>5,304.72</strong> <em>+0.39%</em></span>
            <span>NASDAQ <strong>16,920.58</strong> <em>+0.65%</em></span>
            <span>VIX <strong>12.41</strong> <em className="negative">-1.03%</em></span>
            <Icon name="bell" />
          </div>
        </header>

        <section className="search-section">
          <div>
            <h1>Stock intelligence</h1>
            <p>Search a ticker to assemble market, fundamentals, news, and risk context.</p>
          </div>
          <form className="search-form" onSubmit={analyze}>
            <label className="ticker-input">
              <Icon name="search" />
              <span className="sr-only">Stock ticker</span>
              <input
                autoCapitalize="characters"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter ticker, e.g. AAPL"
              />
            </label>
            <button className="analyze-button" type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing" : "Analyze"}
            </button>
          </form>
        </section>

        <div className="content-grid">
          <section className="center-column">
            <article className="quote-card">
              <div className="quote-header">
                <div className="company-lockup">
                  <div className="ticker-mark">{stock.ticker.slice(0, 1)}</div>
                  <div>
                    <h2>{stock.ticker}</h2>
                    <p>{stock.name}</p>
                    <small>{stock.exchange} • {stock.sector} • {stock.industry}</small>
                  </div>
                </div>
                <button className="watch-button" type="button">
                  <Icon name="star" />
                  In Watchlist
                </button>
              </div>
              <div className="quote-summary">
                <div>
                  <strong className="price">{stock.price.toFixed(2)}</strong>
                  <span className={isPositive ? "positive" : "negative"}>
                    {formatSigned(stock.change)} ({formatSigned(stock.changePercent)}%)
                  </span>
                  <small>As of local demo data</small>
                </div>
                <Metric label="Open" value={stock.open.toFixed(2)} />
                <Metric label="Day High" value={stock.high.toFixed(2)} />
                <Metric label="Day Low" value={stock.low.toFixed(2)} />
                <Metric label="Volume" value={stock.volume} />
                <Metric label="Avg Vol (10D)" value={stock.avgVolume} />
                <Metric label="P/E (TTM)" value={stock.peRatio} />
              </div>
            </article>

            <article className="panel">
              <div className="range-row">
                <div>
                  {ranges.map((range) => (
                    <button
                      className={selectedRange === range ? "selected" : ""}
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      type="button"
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <button className="ghost-button" type="button">Indicators</button>
              </div>
              <PriceChart values={stock.chart} positive={isPositive} />
            </article>

            <div className="lower-grid">
              <article className="panel">
                <h3>Key Fundamentals (TTM)</h3>
                <DataTable rows={fundamentals} />
              </article>
              <article className="panel">
                <h3>Earnings</h3>
                <DataTable rows={earnings} />
              </article>
            </div>
          </section>

          <aside className="insight-rail" aria-label="Stock insights">
            <article className="panel signal-card">
              <h3>AI Signal</h3>
              <div className={`signal ${stock.signal.toLowerCase()}`}>
                <Icon name="trend" />
                <strong>{stock.signal}</strong>
              </div>
              <Metric label="Confidence" value={`${stock.confidence}%`} />
              <Metric label="Time Horizon" value="1-3 Months" />
              <Metric label="AI Score" value={`${stock.aiScore} / 100`} />
              <div className="score-track">
                <span style={{ width: `${stock.aiScore}%` }} />
              </div>
            </article>

            <article className="panel risk-card">
              <h3>Risk Score</h3>
              <div className="risk-layout">
                <div>
                  <strong className={stock.riskTone === "High" ? "negative" : "amber"}>{stock.riskTone}</strong>
                  <Metric label="Volatility" value={stock.riskTone === "Low" ? "Medium" : stock.riskTone} />
                  <Metric label="Valuation" value={stock.riskTone} />
                  <Metric label="Sentiment" value={stock.sentiment} />
                </div>
                <div className="risk-gauge" style={{ ["--score" as string]: `${stock.riskScore}%` }}>
                  <strong>{stock.riskScore}</strong>
                  <span>/ 100</span>
                </div>
              </div>
            </article>

            <article className="panel">
              <h3>About {stock.name}</h3>
              <p className="about-copy">{stock.about}</p>
              <DataTable
                rows={[
                  ["CEO", stock.ceo],
                  ["Employees", stock.employees],
                  ["Headquarters", stock.headquarters],
                  ["IPO", stock.ipo],
                  ["Website", stock.website]
                ]}
              />
            </article>

            <article className="panel news-panel">
              <div className="panel-header">
                <h3>Recent News</h3>
                <button type="button">View All</button>
              </div>
              {stock.news.map((item) => (
                <a href="#" key={item.title} onClick={(event) => event.preventDefault()}>
                  <strong>{item.title}</strong>
                  <span>{item.source} • {item.time}</span>
                </a>
              ))}
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
}
