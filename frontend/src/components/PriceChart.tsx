import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

/* ── Constants ── */

const RANGES = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as const;

const TIME_LABELS: Record<string, string[]> = {
  '1D':  ['9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '4:00 PM'],
  '5D':  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  '1M':  ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  '3M':  ['Jan', 'Feb', 'Mar'],
  '6M':  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  'YTD': ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
  '1Y':  ['Jan', 'Apr', 'Jul', 'Oct'],
  '5Y':  ['2021', '2022', '2023', '2024', '2025'],
  'MAX': ['2015', '2017', '2019', '2021', '2023', '2025'],
};

/* ── Types ── */

interface PriceChartProps {
  data: number[];
  positive: boolean;
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

/* ── PriceChart (SVG-based) ── */

export function PriceChart({ data, positive, selectedRange, onRangeChange }: PriceChartProps) {
  const lineColor = positive ? '#65df82' : '#ff6565';

  /* Compute SVG geometry */
  const { polyline, areaPoints, gridYs } = useMemo(() => {
    const w = 760;
    const h = 250;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(max - min, 1);

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * w;
      const y = h - ((value - min) / range) * (h - 22) - 10;
      return `${x},${y}`;
    });

    return {
      polyline: points.join(' '),
      areaPoints: `0,${h} ${points.join(' ')} ${w},${h}`,
      gridYs: [40, 90, 140, 190, 240],
    };
  }, [data]);

  const labels = TIME_LABELS[selectedRange] ?? TIME_LABELS['1D'];

  return (
    <article className="panel" aria-label="Price chart">
      {/* ── Range selector row ── */}
      <div className="range-row">
        <div>
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              className={selectedRange === range ? 'selected' : ''}
              onClick={() => onRangeChange(range)}
              aria-label={`Show ${range} range`}
            >
              {range}
            </button>
          ))}
        </div>
        <button className="ghost-button" type="button" aria-label="Show chart indicators">
          <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Indicators
        </button>
      </div>

      {/* ── SVG Chart ── */}
      <div className="chart-frame">
        <svg viewBox="0 0 760 250" role="img" aria-label="Price trend chart">
          <defs>
            <linearGradient id="chartGradientFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className="grid-lines">
            {gridYs.map((y) => (
              <line key={y} x1="0" x2="760" y1={y} y2={y} />
            ))}
          </g>

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#chartGradientFill)" />

          {/* Price line */}
          <polyline
            points={polyline}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
          />
        </svg>

        {/* Time axis labels */}
        <div className="time-axis">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
