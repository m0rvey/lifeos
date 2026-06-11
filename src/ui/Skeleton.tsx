interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'heading' | 'circle' | 'rect' | 'card' | 'avatar' | 'button';
  lines?: number;
}

export default function Skeleton({
  className = '',
  width,
  height,
  variant = 'text',
  lines = 1,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton skeleton--text ${i === lines - 1 ? 'skeleton--text-sm' : ''}`}
            style={i === lines - 1 ? { width: '60%' } : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
    />
  );
}
