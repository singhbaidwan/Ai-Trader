import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FundamentalsTableProps {
  title: string;
  rows: Array<[string, string | number]>;
  columns?: number;
}

const MAX_COLLAPSED = 6;

export function FundamentalsTable({ title, rows, columns = 2 }: FundamentalsTableProps) {
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = rows.length > MAX_COLLAPSED;
  const visibleRows = expanded ? rows : rows.slice(0, MAX_COLLAPSED);

  return (
    <div className="panel" aria-label={`${title} data`}>
      <h3>{title}</h3>

      <div
        className="data-table"
        style={columns !== 2 ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
      >
        {visibleRows.map(([label, value]) => (
          <div className="data-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {hasOverflow && (
        <button
          className="ghost-button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Show fewer rows' : 'Show all rows'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            marginTop: 12,
            minHeight: 34,
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          {expanded ? (
            <>
              View Less <ChevronUp size={14} />
            </>
          ) : (
            <>
              View More <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
