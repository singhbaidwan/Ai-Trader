export type Signal = "Bullish" | "Neutral" | "Bearish";

export type StockProfile = {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  avgVolume: string;
  marketCap: string;
  enterpriseValue: string;
  peRatio: number;
  forwardPe: number;
  pegRatio: number;
  priceSales: number;
  dividendYield: string;
  revenue: string;
  grossMargin: string;
  operatingMargin: string;
  netMargin: string;
  roe: string;
  debtEquity: string;
  nextEarnings: string;
  epsEstimate: string;
  epsTtm: string;
  revenueEstimate: string;
  signal: Signal;
  confidence: number;
  aiScore: number;
  riskScore: number;
  riskTone: "Low" | "Moderate" | "High";
  sentiment: "Positive" | "Mixed" | "Negative";
  ceo: string;
  employees: string;
  headquarters: string;
  ipo: string;
  website: string;
  about: string;
  chart: number[];
  sparkline: number[];
  news: Array<{
    title: string;
    source: string;
    time: string;
  }>;
};

const baseChart = [
  192.4, 193.8, 195.2, 194.3, 195.8, 195.1, 194.2, 193.6, 194.5, 195.1, 196.4,
  195.7, 196.1, 195.4, 194.9, 195.8, 196.2, 195.7, 196.4, 196.1, 195.8, 196.2,
  195.3, 195.7, 196.0, 195.5, 195.1, 195.6, 195.2
];

export const stocks: Record<string, StockProfile> = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    price: 195.27,
    change: 2.39,
    changePercent: 1.24,
    open: 193.1,
    high: 196.34,
    low: 192.35,
    volume: "39.58M",
    avgVolume: "56.24M",
    marketCap: "2.99T",
    enterpriseValue: "2.92T",
    peRatio: 29.45,
    forwardPe: 26.1,
    pegRatio: 2.27,
    priceSales: 7.81,
    dividendYield: "0.48%",
    revenue: "383.29B",
    grossMargin: "45.90%",
    operatingMargin: "29.83%",
    netMargin: "24.27%",
    roe: "164.23%",
    debtEquity: "1.80",
    nextEarnings: "Jul 31, 2026",
    epsEstimate: "1.50",
    epsTtm: "6.63",
    revenueEstimate: "90.78B",
    signal: "Bullish",
    confidence: 72,
    aiScore: 72,
    riskScore: 46,
    riskTone: "Moderate",
    sentiment: "Positive",
    ceo: "Tim Cook",
    employees: "161,000",
    headquarters: "Cupertino, California, USA",
    ipo: "Dec 12, 1980",
    website: "apple.com",
    about:
      "Apple designs consumer devices, software, and digital services with a large installed base and durable brand economics.",
    chart: baseChart,
    sparkline: [2, 5, 3, 7, 5, 8, 7, 10],
    news: [
      { title: "Services strength supports margin outlook", source: "CNBC", time: "2h ago" },
      { title: "Supply chain checks point to steady demand", source: "Reuters", time: "4h ago" },
      { title: "Developers weigh platform changes", source: "Bloomberg", time: "1d ago" }
    ]
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software Infrastructure",
    price: 415.52,
    change: 2.41,
    changePercent: 0.58,
    open: 413.33,
    high: 418.04,
    low: 410.92,
    volume: "21.10M",
    avgVolume: "25.88M",
    marketCap: "3.09T",
    enterpriseValue: "3.02T",
    peRatio: 36.2,
    forwardPe: 29.7,
    pegRatio: 2.11,
    priceSales: 12.8,
    dividendYield: "0.71%",
    revenue: "236.58B",
    grossMargin: "69.76%",
    operatingMargin: "44.59%",
    netMargin: "36.43%",
    roe: "37.13%",
    debtEquity: "0.35",
    nextEarnings: "Jul 23, 2026",
    epsEstimate: "3.27",
    epsTtm: "11.50",
    revenueEstimate: "64.92B",
    signal: "Bullish",
    confidence: 78,
    aiScore: 80,
    riskScore: 38,
    riskTone: "Low",
    sentiment: "Positive",
    ceo: "Satya Nadella",
    employees: "221,000",
    headquarters: "Redmond, Washington, USA",
    ipo: "Mar 13, 1986",
    website: "microsoft.com",
    about:
      "Microsoft operates cloud, productivity, gaming, and AI infrastructure businesses with recurring enterprise demand.",
    chart: baseChart.map((point, index) => point * 2.12 + index * 0.18),
    sparkline: [3, 4, 6, 5, 8, 7, 9, 11],
    news: [
      { title: "Azure growth keeps investors focused on AI capacity", source: "The Verge", time: "1h ago" },
      { title: "Enterprise software budgets remain resilient", source: "WSJ", time: "6h ago" },
      { title: "Cloud margin expansion offsets capex concerns", source: "CNBC", time: "1d ago" }
    ]
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    industry: "Auto Manufacturers",
    price: 173.42,
    change: -1.96,
    changePercent: -1.12,
    open: 176.1,
    high: 177.32,
    low: 171.88,
    volume: "84.21M",
    avgVolume: "101.42M",
    marketCap: "552.31B",
    enterpriseValue: "535.78B",
    peRatio: 44.8,
    forwardPe: 58.4,
    pegRatio: 3.7,
    priceSales: 5.5,
    dividendYield: "0.00%",
    revenue: "96.77B",
    grossMargin: "18.25%",
    operatingMargin: "8.18%",
    netMargin: "10.87%",
    roe: "21.02%",
    debtEquity: "0.12",
    nextEarnings: "Jul 17, 2026",
    epsEstimate: "0.64",
    epsTtm: "3.87",
    revenueEstimate: "24.98B",
    signal: "Neutral",
    confidence: 59,
    aiScore: 58,
    riskScore: 68,
    riskTone: "High",
    sentiment: "Mixed",
    ceo: "Elon Musk",
    employees: "140,000",
    headquarters: "Austin, Texas, USA",
    ipo: "Jun 29, 2010",
    website: "tesla.com",
    about:
      "Tesla produces electric vehicles, energy storage systems, and autonomous driving technology with high growth and volatility.",
    chart: baseChart.map((point, index) => 180 - (point - 192) * 1.3 - index * 0.3),
    sparkline: [9, 7, 8, 5, 6, 4, 3, 2],
    news: [
      { title: "Delivery mix keeps margin debate active", source: "Reuters", time: "3h ago" },
      { title: "Investors watch robotaxi milestones", source: "Bloomberg", time: "8h ago" },
      { title: "EV price competition pressures valuation", source: "CNBC", time: "1d ago" }
    ]
  },
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    price: 1017.29,
    change: 18.87,
    changePercent: 1.89,
    open: 996.6,
    high: 1024.8,
    low: 991.34,
    volume: "48.35M",
    avgVolume: "52.11M",
    marketCap: "2.51T",
    enterpriseValue: "2.47T",
    peRatio: 64.1,
    forwardPe: 37.5,
    pegRatio: 1.49,
    priceSales: 31.4,
    dividendYield: "0.03%",
    revenue: "60.92B",
    grossMargin: "72.72%",
    operatingMargin: "54.12%",
    netMargin: "48.85%",
    roe: "93.61%",
    debtEquity: "0.20",
    nextEarnings: "Aug 21, 2026",
    epsEstimate: "6.09",
    epsTtm: "15.88",
    revenueEstimate: "28.72B",
    signal: "Bullish",
    confidence: 84,
    aiScore: 86,
    riskScore: 52,
    riskTone: "Moderate",
    sentiment: "Positive",
    ceo: "Jensen Huang",
    employees: "29,600",
    headquarters: "Santa Clara, California, USA",
    ipo: "Jan 22, 1999",
    website: "nvidia.com",
    about:
      "NVIDIA designs GPUs, networking systems, and AI computing platforms central to data center acceleration.",
    chart: baseChart.map((point, index) => point * 5.12 + index * 1.9),
    sparkline: [4, 7, 6, 9, 11, 10, 13, 15],
    news: [
      { title: "AI accelerator demand remains supply constrained", source: "Reuters", time: "2h ago" },
      { title: "Data center revenue dominates estimates", source: "CNBC", time: "5h ago" },
      { title: "Cloud providers expand GPU clusters", source: "Bloomberg", time: "1d ago" }
    ]
  }
};

export const watchlistTickers = ["AAPL", "MSFT", "TSLA", "NVDA"];

export function getStockProfile(input: string): StockProfile {
  const ticker = input.trim().toUpperCase() || "AAPL";
  const known = stocks[ticker];

  if (known) {
    return known;
  }

  const seed = Array.from(ticker).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = 35 + (seed % 240) + (seed % 17) / 10;
  const direction = seed % 2 === 0 ? 1 : -1;
  const changePercent = Number((direction * (0.35 + (seed % 28) / 20)).toFixed(2));
  const change = Number(((price * changePercent) / 100).toFixed(2));
  const chart = baseChart.map((point, index) => price + (point - 195) * 0.72 + Math.sin(index + seed) * 1.4);

  return {
    ...stocks.AAPL,
    ticker,
    name: `${ticker} Holdings`,
    exchange: "NASDAQ",
    sector: "Market Research",
    industry: "Generated Local Profile",
    price: Number(price.toFixed(2)),
    change,
    changePercent,
    open: Number((price - change * 0.6).toFixed(2)),
    high: Number((price + Math.abs(change) + 1.8).toFixed(2)),
    low: Number((price - Math.abs(change) - 1.4).toFixed(2)),
    volume: `${(12 + (seed % 70)).toFixed(2)}M`,
    avgVolume: `${(18 + (seed % 82)).toFixed(2)}M`,
    marketCap: `${(8 + (seed % 600)).toFixed(2)}B`,
    enterpriseValue: `${(10 + (seed % 640)).toFixed(2)}B`,
    peRatio: Number((14 + (seed % 45) + 0.35).toFixed(2)),
    forwardPe: Number((12 + (seed % 38) + 0.2).toFixed(2)),
    signal: changePercent > 0.8 ? "Bullish" : changePercent < -0.8 ? "Bearish" : "Neutral",
    confidence: 48 + (seed % 36),
    aiScore: 45 + (seed % 42),
    riskScore: 34 + (seed % 48),
    riskTone: seed % 3 === 0 ? "Low" : seed % 3 === 1 ? "Moderate" : "High",
    sentiment: changePercent > 0 ? "Positive" : "Mixed",
    ceo: "Research pending",
    employees: "N/A",
    headquarters: "N/A",
    ipo: "N/A",
    website: `${ticker.toLowerCase()}.com`,
    about:
      "This is a generated local profile. Add a backend market data provider to replace it with live company fundamentals and news.",
    chart,
    sparkline: chart.slice(-8).map((point) => Number(point.toFixed(2))),
    news: [
      { title: `${ticker} added to local research workspace`, source: "AiTrader", time: "now" },
      { title: "Connect Alpha Vantage or Yahoo Finance for live headlines", source: "Setup", time: "local" },
      { title: "Generated profile keeps the dashboard interactive offline", source: "AiTrader", time: "local" }
    ]
  };
}
