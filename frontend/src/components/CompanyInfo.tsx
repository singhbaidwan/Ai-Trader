import { ExternalLink } from 'lucide-react';
import type { StockProfile } from '@/types';

interface CompanyInfoProps {
  stock: StockProfile;
}

export function CompanyInfo({ stock }: CompanyInfoProps) {
  const websiteUrl = stock.website.startsWith('http')
    ? stock.website
    : `https://${stock.website}`;

  return (
    <div className="panel" aria-label={`About ${stock.name}`}>
      <h3>About {stock.name}</h3>

      <p className="about-copy">{stock.about}</p>

      <div className="data-table">
        <DataRow label="CEO" value={stock.ceo} />
        <DataRow label="Employees" value={stock.employees} />
        <DataRow label="Headquarters" value={stock.headquarters} />
        <DataRow label="IPO" value={stock.ipo} />
        <div className="data-row">
          <span>Website</span>
          <strong>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${stock.website}`}
              style={{
                color: 'var(--green)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {stock.website}
              <ExternalLink size={12} />
            </a>
          </strong>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
