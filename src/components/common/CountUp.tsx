import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useGrouping?: boolean;
  startOnView?: boolean;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  useGrouping = true,
  startOnView = true,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const prevValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If startOnView is true and element is not yet in view, don't start
    if (startOnView && !isInView) return;

    const startValue = prevValueRef.current;
    const targetValue = Number.isFinite(value) ? value : 0;
    const change = targetValue - startValue;

    // If no change, set target immediately
    if (change === 0) {
      setDisplayValue(targetValue);
      return;
    }

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo easing curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + change * ease;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
        prevValueRef.current = targetValue;
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, isInView, startOnView]);

  const formatted = (() => {
    const rounded = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();
    if (useGrouping) {
      const parts = rounded.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return rounded;
  })();

  return (
    <span ref={ref} className={`inline-block tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
