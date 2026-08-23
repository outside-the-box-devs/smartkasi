'use client';

import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 600;

/**
 * Animates a number from its previous value to `target` with an ease-out
 * curve. Jumps straight to the value when the OS asks for reduced motion.
 * Safe across rapid changes: always animates from the last displayed value.
 */
export function useCountUp(target: number): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    if (displayRef.current === target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const apply = (value: number) => {
      displayRef.current = value;
      setDisplay(value);
    };
    if (reduce) {
      // Still async so state updates never happen synchronously in the effect.
      raf = requestAnimationFrame(() => apply(target));
      return () => cancelAnimationFrame(raf);
    }
    const from = displayRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      apply(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}
