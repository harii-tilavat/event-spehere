/** All money is integer paise (docs/01 §2.6); render as ₹ for display. */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

/** API timestamps are UTC ISO strings; render in the viewer's locale/timezone. */
export function formatDateTime(utcIso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcIso));
}

export function formatDate(utcIso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(utcIso));
}
