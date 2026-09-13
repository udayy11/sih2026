import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to smoothly animate a number towards a target value using requestAnimationFrame.
 * Honors prefers-reduced-motion and does not cause layout thrashing.
 */
export function useAnimatedNumber(
  targetValue: number,
  durationMs: number = 450,
  fractionDigits: number = 0
): number {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const startValRef = useRef<number>(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const targetValRef = useRef<number>(targetValue);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || durationMs <= 0) {
      setDisplayValue(targetValue);
      startValRef.current = targetValue;
      targetValRef.current = targetValue;
      return;
    }

    startValRef.current = displayValue;
    targetValRef.current = targetValue;
    startTimeRef.current = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutCubic(progress);

      const current =
        startValRef.current +
        (targetValRef.current - startValRef.current) * easedProgress;

      const factor = Math.pow(10, fractionDigits);
      setDisplayValue(Math.round(current * factor) / factor);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetValue, durationMs, fractionDigits]);

  return displayValue;
}
