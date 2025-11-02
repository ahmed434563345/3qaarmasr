import { useEffect, useRef } from 'react';
import { trackTimeOnPage } from '@/lib/analytics';

export const useTimeTracking = (pageName: string) => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Track time on unmount
    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        trackTimeOnPage(pageName, timeSpent);
      }
    };
  }, [pageName]);
};

export default useTimeTracking;