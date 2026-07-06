import { buildKey, type QueryEndpoint } from "@/api/core";
import { healthPaths } from "./paths";

export const queryEndpoints = {
  getHealth: (): QueryEndpoint => ({
    url: healthPaths.status(),
    queryKey: buildKey("health", "status"),
  }),
};
