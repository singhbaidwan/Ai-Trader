import type { CSSProperties } from 'react';

/* ── Shared shimmer styles (injected once via <style> tag) ── */

const shimmerStyles = `
.skeleton {
  background: linear-gradient(90deg, #141d25 25%, #19232d 50%, #141d25 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

function ShimmerCSS() {
  return <style>{shimmerStyles}</style>;
}

/* ── Primitive skeletons ── */

interface SkeletonLineProps {
  width?: string;
  height?: string;
  style?: CSSProperties;
}

export function SkeletonLine({ width = '100%', height = '14px', style }: SkeletonLineProps) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

interface SkeletonBlockProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: CSSProperties;
}

export function SkeletonBlock({
  width = '100%',
  height = '80px',
  borderRadius = '6px',
  style,
}: SkeletonBlockProps) {
  return <div className="skeleton" style={{ width, height, borderRadius, ...style }} />;
}

export function SkeletonChart() {
  return (
    <div
      className="skeleton"
      style={{
        width: '100%',
        height: '292px',
        borderRadius: '6px',
      }}
    />
  );
}

/* ── Composite skeletons ── */

export function SkeletonCard() {
  return (
    <div style={{ display: 'grid', gap: 12, padding: 16 }}>
      <SkeletonLine width="40%" height="18px" />
      <SkeletonLine width="100%" height="14px" />
      <SkeletonLine width="75%" height="14px" />
      <SkeletonLine width="60%" height="14px" />
    </div>
  );
}

/** Matches the QuoteCard layout — ticker mark, title, price row, metrics */
export function QuoteCardSkeleton() {
  return (
    <>
      <ShimmerCSS />
      <div className="quote-card" aria-label="Loading stock quote" aria-busy="true">
        {/* Header row */}
        <div className="quote-header" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="company-lockup">
            <SkeletonBlock width="56px" height="56px" borderRadius="8px" />
            <div style={{ display: 'grid', gap: 8, minWidth: 0, flex: 1 }}>
              <SkeletonLine width="80px" height="22px" />
              <SkeletonLine width="160px" height="14px" />
              <SkeletonLine width="220px" height="12px" />
            </div>
          </div>
          <SkeletonBlock width="130px" height="36px" borderRadius="6px" />
        </div>

        {/* Summary row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(160px, 1.25fr) repeat(6, minmax(62px, 1fr))',
            gap: 10,
            paddingTop: 16,
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <SkeletonLine width="120px" height="34px" />
            <SkeletonLine width="140px" height="14px" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'grid', gap: 5 }}>
              <SkeletonLine width="60px" height="14px" />
              <SkeletonLine width="50px" height="12px" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Matches the PriceChart layout — range selector + chart area */
export function ChartSkeleton() {
  return (
    <>
      <ShimmerCSS />
      <div className="panel" aria-label="Loading chart" aria-busy="true">
        {/* Range row */}
        <div className="range-row">
          <div style={{ display: 'flex', gap: 22 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonLine key={i} width="28px" height="20px" />
            ))}
          </div>
          <SkeletonBlock width="100px" height="30px" borderRadius="6px" />
        </div>

        {/* Chart area */}
        <div className="chart-frame">
          <SkeletonChart />
        </div>
      </div>
    </>
  );
}

/** Generic panel skeleton — title + rows */
export function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      <ShimmerCSS />
      <div className="panel" aria-label="Loading panel" aria-busy="true">
        <SkeletonLine width="140px" height="18px" style={{ marginBottom: 14 }} />
        <div style={{ display: 'grid', gap: 10 }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                borderTop: '1px solid var(--line-soft)',
                paddingTop: 8,
              }}
            >
              <SkeletonLine width={`${40 + (i % 3) * 15}%`} height="13px" />
              <SkeletonLine width="60px" height="13px" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
