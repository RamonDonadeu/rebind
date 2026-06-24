"use client";

import { useRef, type TouchEventHandler } from "react";

const SWIPE_THRESHOLD_PX = 50;
const MAX_VERTICAL_DRIFT_PX = 72;

type UsePageSwipeOptions = {
  enabled?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

export function usePageSwipe({
  enabled = true,
  onSwipeLeft,
  onSwipeRight,
}: UsePageSwipeOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart: TouchEventHandler = (event) => {
    if (!enabled) {
      return;
    }

    if (event.touches.length !== 1) {
      startRef.current = null;
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    startRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd: TouchEventHandler = (event) => {
    if (!enabled || !startRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const start = startRef.current;
    startRef.current = null;

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaY) > MAX_VERTICAL_DRIFT_PX) {
      return;
    }

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      onSwipeLeft?.();
      return;
    }

    onSwipeRight?.();
  };

  const onTouchCancel: TouchEventHandler = () => {
    startRef.current = null;
  };

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
