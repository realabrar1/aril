'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analyticsTracker } from '@/utils/analyticsTracker';

export function AnalyticsTrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef<string>('');

  useEffect(() => {
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (fullUrl !== prevPath.current) {
      prevPath.current = fullUrl;

      // Asynchronously track page view without blocking main thread
      setTimeout(() => {
        analyticsTracker.trackPageView({
          page_url: pathname,
          page_title: document.title,
          page_type: analyticsTracker.determinePageType(pathname),
        });
      }, 100);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
