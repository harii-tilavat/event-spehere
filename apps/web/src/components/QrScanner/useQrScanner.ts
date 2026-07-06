import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

const REGION_ID = "qr-scanner-region";
const SCAN_DEBOUNCE_MS = 2500;

interface UseQrScannerArgs {
  onScan: (payload: string) => void;
  paused: boolean;
}

export function useQrScanner({ onScan, paused }: UseQrScannerArgs) {
  const [isActive, setIsActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const start = async () => {
    if (scannerRef.current) return;
    try {
      const scanner = new Html5Qrcode(REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          if (pausedRef.current) return;
          const now = Date.now();
          if (decoded === lastScanRef.current.value && now - lastScanRef.current.at < SCAN_DEBOUNCE_MS) return;
          lastScanRef.current = { value: decoded, at: now };
          onScanRef.current(decoded);
        },
        () => undefined, // per-frame decode misses are expected noise
      );
      setIsActive(true);
    } catch {
      scannerRef.current = null;
      toast.error("Could not access the camera — use manual entry below");
    }
  };

  const stop = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setIsActive(false);
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // camera already stopped
      }
    }
  };

  // Always release the camera on unmount
  useEffect(() => {
    return () => {
      void stop();
    };
     
  }, []);

  return { regionId: REGION_ID, isActive, start, stop };
}
