interface CircularProgressRingProps {
  value: number; // 0–100
  size?: number; // px, default 120
  strokeWidth?: number;
  label?: string;
  color?: string; // CSS color, default var(--accent)
}

export default function CircularProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'var(--accent)',
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="progress-ring-wrapper" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Background circle */}
        <circle
          className="progress-ring-bg"
          stroke="var(--border)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground animated progress */}
        <circle
          className="progress-ring-indicator"
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.35s',
          }}
        />
      </svg>
      <div className="progress-ring-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <span className="progress-ring-value" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'bold', fontSize: `${size * 0.18}px`, color: 'var(--text-primary)' }}>
          {Math.round(clampedValue)}%
        </span>
        {label && (
          <span className="progress-ring-label" style={{ fontSize: `${size * 0.08}px`, color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
