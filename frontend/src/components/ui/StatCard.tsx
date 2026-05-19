import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
  readonly icon?: React.ReactNode;
  readonly accentColor?: string;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly fillPercent?: number;
}

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accentColor = 'var(--red)',
  loading = false,
  onClick,
  fillPercent,
}: StatCardProps) {
  if (loading) return <LoadingSkeleton variant="stat" />;

  const iconBg = accentColor.startsWith('var')
    ? undefined
    : `${accentColor}26`;

  return (
    <div className="stat-card" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className="stat-card__top">
        {icon && (
          <div
            className="stat-card__icon"
            style={{ background: iconBg ?? 'var(--red-dim)', color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
      {fillPercent !== undefined && (
        <div className="stat-card__bar">
          <div
            className="stat-card__fill"
            style={{ width: `${Math.min(fillPercent, 100)}%`, background: accentColor }}
          />
        </div>
      )}
    </div>
  );
}
