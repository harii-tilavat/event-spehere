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
