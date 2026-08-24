'use client';

import { useToast } from '@astryxdesign/core/Toast';

interface Feedback {
  /** Transient confirmation — auto-dismisses after 5s. */
  success: (body: string, uniqueID?: string) => () => void;
  /** Failure — persists until dismissed so it is never missed. */
  error: (body: string, uniqueID?: string) => () => void;
}

/**
 * Standardised action feedback for the whole app. One viewport, consistent
 * durations, dedupe-friendly IDs. Persistent context (licence status, offline
 * warning) belongs in Banners — this channel is for moment-in-time results.
 */
export function useFeedback(): Feedback {
  const showToast = useToast();
  return {
    success: (body, uniqueID) =>
      showToast({ body, type: 'info', ...(uniqueID ? { uniqueID } : {}) }),
    error: (body, uniqueID) =>
      showToast({ body, type: 'error', ...(uniqueID ? { uniqueID } : {}) }),
  };
}
