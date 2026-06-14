import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accent?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  accent = false,
  trend,
}: StatCardProps) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {icon && <div className="stat-card__icon">{icon}</div>}
      </div>
      <div className="stat-card__value-wrapper" role="status" aria-live="polite" aria-atomic="true">
        <span className="stat-card__value">{value}</span>
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend}`} aria-hidden="true">
            {trend === 'up' && '\u25B2'}
            {trend === 'down' && '\u25BC'}
            {trend === 'neutral' && '\u25CF'}
          </span>
        )}
      </div>
      {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
    </div>
  );
}
