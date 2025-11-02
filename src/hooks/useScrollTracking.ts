import { useEffect } from 'react';
import { trackScrollDepth } from '@/lib/analytics';

export const useScrollTracking = () => {
  useEffect(() => {
    let maxScroll = 0;
    const scrollThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      
      if (scrolled > maxScroll) {
        maxScroll = scrolled;
        
        // Track each threshold only once
        scrollThresholds.forEach(threshold => {
          if (scrolled >= threshold && !trackedThresholds.has(threshold)) {
            trackedThresholds.add(threshold);
            trackScrollDepth(threshold);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};

export default useScrollTracking;