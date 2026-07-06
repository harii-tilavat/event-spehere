import { cn } from "@eventsphere/ui";
import { useQrCode } from "./useQrCode";
import type { QrCodeProps } from "./types";

export function QrCode({ value, size = 160, className }: QrCodeProps) {
  const { dataUrl } = useQrCode(value, size);

  if (!dataUrl) {
    return <div className={cn("animate-pulse rounded-lg bg-muted", className)} style={{ width: size, height: size }} />;
  }
  return <img src={dataUrl} alt="Ticket QR code" width={size} height={size} className={cn("rounded-lg", className)} />;
}
