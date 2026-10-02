/** e.g. 2 Oct · 14:32 */
export function formatWhen(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return "—";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);

  const hasTime = isoOrDate.includes("T");
  const day = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  if (!hasTime) return day;

  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}
