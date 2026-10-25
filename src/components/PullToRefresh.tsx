import { useEffect, useRef, useState } from "react";

const THRESHOLD = 70;
const MAX = 110;

export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startY.current = window.scrollY <= 0 && e.touches.length === 1 && t ? t.clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (startY.current === null || !t) return;
      const dy = t.clientY - startY.current;
      if (dy <= 0 || window.scrollY > 0) {
        pullRef.current = 0;
        setPull(0);
        return;
      }
      const eased = Math.min(MAX, dy * 0.5);
      pullRef.current = eased;
      setPull(eased);
    };
    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        setTimeout(() => window.location.reload(), 350);
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  if (pull === 0 && !refreshing) return null;
  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-0 z-[100] -translate-x-1/2"
      style={{
        transform: `translate(-50%, ${pull - 40}px)`,
        transition: startY.current === null ? "transform 200ms ease-out" : "none",
        opacity: progress,
      }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md">
        <div
          className={`h-5 w-5 rounded-full border-2 border-muted border-t-primary ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 300}deg)` }}
        />
      </div>
    </div>
  );
}
