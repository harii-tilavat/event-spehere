import { Camera, CameraOff } from "lucide-react";
import { Button } from "@eventsphere/ui";
import { useQrScanner } from "./useQrScanner";
import type { QrScannerProps } from "./types";

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const { regionId, isActive, start, stop } = useQrScanner({ onScan, paused });

  return (
    <div className="space-y-2">
      <div id={regionId} className="overflow-hidden rounded-xl border bg-black/40 [&_video]:w-full" />
      {isActive ? (
        <Button variant="outline" size="sm" className="w-full" onClick={() => void stop()}>
          <CameraOff className="size-4" /> Stop camera
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => void start()}>
          <Camera className="size-4" /> Start camera scanner
        </Button>
      )}
    </div>
  );
}
