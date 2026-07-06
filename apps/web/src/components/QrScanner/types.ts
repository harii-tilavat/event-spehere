export interface QrScannerProps {
  onScan: (payload: string) => void;
  /** Pause decoding (e.g. while a check-in request is in flight). */
  paused?: boolean;
}
