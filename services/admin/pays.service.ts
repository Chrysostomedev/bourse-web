import { get, post, put, del } from "@/core/axios";
import type { Pays, CreatePaysDTO, UpdatePaysDTO, PaginatedResponse, ApiResponse } from "@/types";

/**
 * Service pour la gestion des pays (countries)
 * Endpoints réels: GET/POST /admin/countries, GET/PUT/DELETE /admin/countries/{id}
 */
export const paysService = {
  /**
   * Liste paginée des pays
   * GET /admin/countries?page=1&per_page=20
   */
  async list(page = 1, perPage = 20, search?: string) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (search) params.set("search", search);

    return get<PaginatedResponse<Pays>>(`/admin/countries?${params.toString()}`);
  },

  /**
   * Récupère tous les pays (non paginé)
   * GET /admin/countries
   */
  async getAll() {
    return get<{ data: Pays[] }>("/admin/countries");
  },

  /**
   * Récupère un pays par ID
   * GET /admin/countries/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<Pays>>(`/admin/countries/${id}`);
  },

  /**
   * Crée un nouveau pays
   * POST /admin/countries
   */
  async create(data: CreatePaysDTO) {
    return post<ApiResponse<Pays>>("/admin/countries", data);
  },

  /**
   * Met à jour un pays
   * PUT /admin/countries/{id}
   */
  async update(id: number, data: UpdatePaysDTO) {
    return put<ApiResponse<Pays>>(`/admin/countries/${id}`, data);
  },

  /**
   * Supprime un pays
   * DELETE /admin/countries/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/countries/${id}`);
  },

  async getActive() {
    return get<any>("/admin/countries?status=active");
  },
};
