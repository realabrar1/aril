'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const LEAVE_TITLE = 'You left this… 💖 Come Back';

export function TabTitleHandler() {
  const pathname = usePathname();
  const originalTitleRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track title when page changes while visible
    if (!document.hidden && document.title && document.title !== LEAVE_TITLE) {
      originalTitleRef.current = document.title;
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.hidden && document.title && document.title !== LEAVE_TITLE) {
      originalTitleRef.current = document.title;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (document.title && document.title !== LEAVE_TITLE) {
          originalTitleRef.current = document.title;
        }
        document.title = LEAVE_TITLE;
      } else {
        if (originalTitleRef.current) {
          document.title = originalTitleRef.current;
        }
      }
    };

    // Use MutationObserver to capture title changes dynamically made by Next.js metadata
    const targetNode = document.querySelector('title');
    let observer: MutationObserver | null = null;

    if (targetNode) {
      observer = new MutationObserver(() => {
        if (!document.hidden && document.title && document.title !== LEAVE_TITLE) {
          originalTitleRef.current = document.title;
        }
      });
      observer.observe(targetNode, { childList: true, characterData: true, subtree: true });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, []);

  return null;
}
