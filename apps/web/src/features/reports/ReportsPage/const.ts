import { BarChart3, Ticket, UserCheck } from "lucide-react";
import type { ReportKind } from "@/api";
import type { LucideIcon } from "lucide-react";

export const REPORTS: { kind: ReportKind; title: string; description: string; icon: LucideIcon }[] = [
  {
    kind: "revenue",
    title: "Revenue",
    description: "Per-event revenue, confirmed bookings, and tickets sold",
    icon: BarChart3,
  },
  {
    kind: "bookings",
    title: "Bookings",
    description: "Every booking with attendee, status, and amount",
    icon: Ticket,
  },
  {
    kind: "attendance",
    title: "Attendance",
    description: "Check-in counts and rates per event",
    icon: UserCheck,
  },
];
