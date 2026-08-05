/**
 * Fonctions de formatage des données
 */

export function formatDateShort(date: string | Date | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR");
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fr-FR");
}
