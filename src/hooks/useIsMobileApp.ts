import { useState, useEffect } from 'react';

export function useIsMobileApp() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const check = () => setIsStandalone(
      mq.matches || (navigator as any).standalone === true
    );
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  return isStandalone;
}
