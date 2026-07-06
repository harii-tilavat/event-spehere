import { useState } from "react";
import { toast } from "sonner";
import { downloadReportCsv, type ReportKind } from "@/api";
import { getErrorMessage } from "@/api/core";

export function useReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [downloading, setDownloading] = useState<ReportKind | null>(null);

  const handleDownload = async (kind: ReportKind) => {
    setDownloading(kind);
    try {
      await downloadReportCsv(kind, { from: from || undefined, to: to || undefined });
      toast.success("Report downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(null);
    }
  };

  return { from, setFrom, to, setTo, downloading, handleDownload };
}
