import { useMemo } from 'react';
import { type Transaction } from '../../types';
import { formatCurrency } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface BalanceChartProps {
  transactions: Transaction[];
}

export default function BalanceChart({ transactions }: BalanceChartProps) {
  const { t } = useI18n();
  const chartData = useMemo(() => {
    // Sort transactions by date ascending
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );

    let runningBalance = 0;
    const history: { date: string; balance: number }[] = [];
    for (const tx of sorted) {
      runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
      history.push({
        date: tx.dateISO,
        balance: runningBalance,
      });
    }

    return history;
  }, [transactions]);

  // SVG parameters
  const width = 600;
  const height = 250;
  const padding = 30;

  const points = useMemo(() => {
    if (chartData.length === 0) return [];

    const balances = chartData.map((d) => d.balance);
    const maxVal = Math.max(...balances, 1);
    const minVal = Math.min(...balances, 0);
    const valRange = maxVal - minVal || 1;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return chartData.map((d, index) => {
      const x = padding + (index / (chartData.length - 1 || 1)) * chartWidth;
      // Invert Y axis: high balance at the top (padding)
      const y = padding + chartHeight - ((d.balance - minVal) / valRange) * chartHeight;
      return { x, y, balance: d.balance, date: d.date };
    });
  }, [chartData]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const chartBottom = height - padding;
    return `${pathD} L ${last.x} ${chartBottom} L ${first.x} ${chartBottom} Z`;
  }, [points, pathD]);

  if (transactions.length < 2) {
    return (
      <div
        style={{
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          background: 'rgba(255,255,255,0.01)',
          borderRadius: '8px',
          border: '1px dashed var(--border)',
        }}
      >
        {t('finance.chart.insufficientData')}
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}
      >
        {t('finance.chart.balanceDynamics')}
      </span>
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            {/* Smooth line gradient */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
            </linearGradient>

            {/* Area fill gradient */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal center) */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Area under the line */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Line itself */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            // Draw circle for first, last, and every 3rd point to prevent clutter
            const isKeyPoint = i === 0 || i === points.length - 1 || i % 3 === 0;
            if (!isKeyPoint) return null;

            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="var(--bg-secondary)"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  fill="var(--text-primary)"
                  fontSize="0.65rem"
                  fontWeight="bold"
                  textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                >
                  {formatCurrency(p.balance)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
