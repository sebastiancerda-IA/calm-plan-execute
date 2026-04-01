interface SkeletonLoaderProps {
  variant?: 'page' | 'widget' | 'mini';
}

function ShimmerBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded bg-muted ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 0%, hsl(var(--idma-green) / 0.08) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function SkeletonLoader({ variant = 'page' }: SkeletonLoaderProps) {
  if (variant === 'mini') {
    return <ShimmerBar className="h-4 w-24" />;
  }

  if (variant === 'widget') {
    return (
      <div className="glass-card rounded-lg p-4 space-y-3">
        <ShimmerBar className="h-3 w-20" />
        <ShimmerBar className="h-6 w-32" />
        <ShimmerBar className="h-3 w-16" />
      </div>
    );
  }

  // page variant
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-lg p-4 space-y-3">
            <ShimmerBar className="h-3 w-20" />
            <ShimmerBar className="h-7 w-24" />
            <ShimmerBar className="h-2 w-16" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-lg p-4 space-y-3">
        <ShimmerBar className="h-4 w-40" />
        <ShimmerBar className="h-32 w-full" />
      </div>
    </div>
  );
}
