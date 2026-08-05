import { get } from "@/core/axios";
import type { StatsOverview, ApiResponse } from "@/types";

/**
 * Service pour récupérer les statistiques du dashboard admin
 * Endpoints réels: GET /dashboard, GET /stats/by-country, GET /stats/by-field
 */
export const statsService = {
  /**
   * Récupère les stats du dashboard
   * GET /dashboard
   */
// statsService.ts
async getOverview() {
  return get<StatsOverview>("/dashboard"); // pas ApiResponse<StatsOverview>
},
  /**
   * Récupère les stats par pays
   * GET /stats/by-country
   */
  async getUsersByCountry() {
    return get<{
      data: Array<{ country: string; count: number }>;
    }>("/stats/by-country");
  },

  /**
   * Récupère les stats par filière
   * GET /stats/by-field
   */
  async getByField() {
    return get<{
      data: Array<{ field: string; count: number }>;
    }>("/stats/by-field");
  },
};
