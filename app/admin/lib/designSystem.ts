/**
 * Design System - Fonctions utilitaires pour les couleurs et styles
 */

export function getStatusColorClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
    case "published":
      return "bg-green-100 text-green-800";
    case "inactive":
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "archived":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export function getPriorityColorClass(priority: string): string {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}
