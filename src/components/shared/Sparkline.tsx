import { memo, useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function SparklineInner({ data, color, width = 60, height = 20 }: SparklineProps) {
  const points = useMemo(() => {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (!points) return null;

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Sparkline = memo(SparklineInner);
