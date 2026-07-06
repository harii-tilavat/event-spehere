import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { fetchHealth } from "../api/health.api";

export function useHealth() {
  return useQuery({
    queryKey: qk.health,
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });
}
