import type { HealthData } from "@eventsphere/shared";
import { get } from "@/lib/axios";

export function fetchHealth(): Promise<HealthData> {
  return get<HealthData>("/health");
}
