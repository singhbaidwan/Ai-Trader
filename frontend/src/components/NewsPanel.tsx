import { ExternalLink } from 'lucide-react';
import type { NewsItem } from '@/types';

interface NewsPanelProps {
  news: NewsItem[];
  companyName?: string;
}

export function NewsPanel({ news, companyName }: NewsPanelProps) {
  const heading = companyName ? `Recent News — ${companyName}` : 'Recent News';

  return (
    <div className="panel news-panel" aria-label={heading}>
      <div className="panel-header">
        <h3>{heading}</h3>
        <button type="button" aria-label="View all news articles">View All</button>
      </div>

      {news.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 0' }}>
          No recent news available.
        </p>
      ) : (
        news.map((item, index) => (
          <a
            key={`${item.title}-${item.source}-${index}`}
            href={item.url ?? '#'}
            target={item.url ? '_blank' : undefined}
            rel={item.url ? 'noopener noreferrer' : undefined}
            aria-label={item.title}
          >
            <strong>{item.title}</strong>
            <span>
              {item.source} · {item.time}
              <ExternalLink
                size={12}
                style={{
                  marginLeft: 6,
                  verticalAlign: 'middle',
                  opacity: 0,
                  transition: 'opacity 0.15s',
                }}
                className="news-link-icon"
              />
            </span>
          </a>
        ))
      )}

      {/* Hover style for the external link icon */}
      <style>{`
        .news-panel a:hover .news-link-icon {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
