import { get, post, put, del } from "@/core/axios";
import type { Partenaire, CreatePartenairesDTO, UpdatePartenairesDTO, PaginatedResponse, ApiResponse } from "@/types";

/**
 * Service pour la gestion des partenaires (partners)
 * Endpoints réels: GET/POST /admin/partners, GET/PUT/DELETE /admin/partners/{id}
 */
export const partenairesService = {
  /**
   * Liste paginée des partenaires
   * GET /admin/partners?page=1&per_page=10
   */
  async list(page = 1, perPage = 10, search?: string, status?: string) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    return get<PaginatedResponse<Partenaire>>(`/admin/partners?${params.toString()}`);
  },

  /**
   * Récupère un partenaire par ID
   * GET /admin/partners/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<Partenaire>>(`/admin/partners/${id}`);
  },

  /**
   * Crée un nouveau partenaire
   * POST /admin/partners
   */
  async create(data: CreatePartenairesDTO) {
    return post<ApiResponse<Partenaire>>("/admin/partners", data);
  },

  /**
   * Met à jour un partenaire
   * PUT /admin/partners/{id}
   */
  async update(id: number, data: UpdatePartenairesDTO) {
    return put<ApiResponse<Partenaire>>(`/admin/partners/${id}`, data);
  },

  /**
   * Supprime un partenaire
   * DELETE /admin/partners/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/partners/${id}`);
  },
};
