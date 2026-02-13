import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logUserActivity } from '../lib/activity';

// Time threshold for considering a page view as unique (in milliseconds)
const PAGE_VIEW_THRESHOLD = 30000; // 30 seconds

/**
 * Hook to track page views in the application
 * Automatically logs page_view events with debouncing and duplicate prevention
 */
export function usePageViewTracker() {
  const location = useLocation();
  const lastPageView = useRef<{ path: string; timestamp: number } | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const now = Date.now();

    // Check if this is a duplicate view
    if (lastPageView.current) {
      const { path, timestamp } = lastPageView.current;
      
      // Skip if same path and within threshold
      if (
        path === currentPath &&
        now - timestamp < PAGE_VIEW_THRESHOLD
      ) {
        return;
      }
    }

    // Update last page view
    lastPageView.current = {
      path: currentPath,
      timestamp: now
    };

    // Log the page view
    logUserActivity('page_view', {
      path: currentPath,
      query: location.search,
      referrer: document.referrer
    });
  }, [location.pathname, location.search]);
}