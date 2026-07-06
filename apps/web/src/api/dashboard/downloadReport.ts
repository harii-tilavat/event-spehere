import { httpClient } from "@/api/core";
import { reportPaths } from "./paths";
import type { ReportKind } from "./types";

/** Fetches a report as CSV and triggers a browser download. */
export async function downloadReportCsv(kind: ReportKind, params?: { from?: string; to?: string }): Promise<void> {
  const res = await httpClient.get(reportPaths[kind](), {
    params: { ...params, format: "csv" },
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `eventsphere-${kind}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
