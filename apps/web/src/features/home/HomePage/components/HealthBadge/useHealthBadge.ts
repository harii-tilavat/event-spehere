import { useGetHealth } from "@/api";

export function useHealthBadge() {
  const { data, isPending, isError } = useGetHealth();

  return {
    isPending,
    isOffline: isError || !data,
    version: data?.version ?? "",
  };
}
