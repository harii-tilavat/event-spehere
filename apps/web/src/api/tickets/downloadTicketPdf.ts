import { httpClient } from "@/api/core";
import { ticketPaths } from "./paths";

/** Fetches the ticket PDF and triggers a browser download. */
export async function downloadTicketPdf(ticketCode: string): Promise<void> {
  const res = await httpClient.get(ticketPaths.pdf(ticketCode), { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `eventsphere-ticket-${ticketCode}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
