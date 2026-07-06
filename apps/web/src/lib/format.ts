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

/** Friendly relative day label — "Today", "Tomorrow", "In 5 days", else the date. */
export function relativeDay(utcIso: string): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date(utcIso)) - startOfDay(new Date())) / 86_400_000);
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} week${days < 14 ? "" : "s"}`;
  return formatDate(utcIso);
}

/** UTC ISO → value for <input type="datetime-local"> in the viewer's timezone. */
export function toDatetimeLocal(utcIso: string): string {
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value → UTC ISO for the API. */
export function fromDatetimeLocal(local: string): string {
  return new Date(local).toISOString();
}
