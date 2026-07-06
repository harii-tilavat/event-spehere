import { useEffect, useState } from "react";

/** Seconds remaining until an ISO timestamp; ticks every second with cleanup. */
export function useCountdown(untilIso: string | null | undefined): number {
  const compute = () => (untilIso ? Math.max(0, Math.floor((new Date(untilIso).getTime() - Date.now()) / 1000)) : 0);
  const [seconds, setSeconds] = useState(compute);

  useEffect(() => {
    setSeconds(compute());
    if (!untilIso) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = compute();
        if (next === 0 && prev !== 0) clearInterval(timer);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compute is derived from untilIso only
  }, [untilIso]);

  return seconds;
}

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
