// utils/formatDate.ts
export function formatDateVN(date: Date | string | number): string {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("vi-VN");
}
