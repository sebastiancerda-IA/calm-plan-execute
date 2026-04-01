export function SkeletonLoader() {
  return (
    <div className="flex items-center justify-center h-64 gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1 h-8 bg-primary/30 rounded-full"
          style={{
            animation: `skeleton-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
