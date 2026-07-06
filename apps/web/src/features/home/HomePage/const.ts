import { CalendarCheck2, QrCode, Ticket } from "lucide-react";

export const HOME_HIGHLIGHTS = [
  {
    icon: CalendarCheck2,
    title: "Discover events",
    body: "Browse and search published events by category, city, and date.",
  },
  {
    icon: Ticket,
    title: "Book & pay online",
    body: "Reserve tickets with secure Razorpay checkout and instant confirmation.",
  },
  {
    icon: QrCode,
    title: "QR check-in",
    body: "Signed QR tickets validated at the venue — one scan, one entry.",
  },
] as const;
