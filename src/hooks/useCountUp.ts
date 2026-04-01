import { useEffect, useState, useRef } from 'react';

export function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (target === prevTarget.current) {
      setValue(target);
      return;
    }

    const start = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      }
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}
