import { get, post, put, del } from "@/core/axios";
import type { Service, CreateServiceDTO, UpdateServiceDTO, PaginatedResponse, ApiResponse } from "@/types";

/**
 * Service pour la gestion des services
 * Endpoints réels: GET/POST /admin/services, GET/PUT/DELETE /admin/services/{id}
 */
export const servicesService = {
  /**
   * Liste des services (non paginée)
   * GET /admin/services
   */
  async list(page = 1, perPage = 10, search?: string, status?: string) {
    // Note: Services endpoint doesn't support pagination, returns all
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);

    const queryString = params.toString();
    const url = queryString ? `/admin/services?${queryString}` : "/admin/services";
    
    return get<PaginatedResponse<Service>>(url);
  },

  /**
   * Récupère tous les services
   * GET /admin/services
   */
  async getAll() {
    return get<{ data: Service[] }>("/admin/services");
  },

  /**
   * Récupère un service par ID
   * GET /admin/services/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<Service>>(`/admin/services/${id}`);
  },

  /**
   * Crée un nouveau service
   * POST /admin/services
   */
  async create(data: CreateServiceDTO) {
    return post<ApiResponse<Service>>("/admin/services", data);
  },

  /**
   * Met à jour un service
   * PUT /admin/services/{id}
   */
  async update(id: number, data: UpdateServiceDTO) {
    return put<ApiResponse<Service>>(`/admin/services/${id}`, data);
  },

  /**
   * Supprime un service
   * DELETE /admin/services/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/services/${id}`);
  },
};
