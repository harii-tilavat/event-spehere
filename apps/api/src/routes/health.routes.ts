import { Router } from "express";
import type { HealthData } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json") as { version: string };

export const healthRoutes = Router();

healthRoutes.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data: HealthData = {
      status: "ok",
      version,
      uptimeSeconds: Math.round(process.uptime()),
    };
    ok(res, "EventSphere API is healthy", data);
  }),
);
