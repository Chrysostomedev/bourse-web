import { get, post, put, del } from "@/core/axios";
import type { User, CreateUserDTO, UpdateUserDTO, PaginatedResponse, ApiResponse } from "@/types";

/**
 * Service pour la gestion des utilisateurs
 * Endpoints réels: GET /admin/users, GET /admin/users/{id}, DELETE /admin/users/{id}, PATCH /admin/users/{id}/role
 */
export const usersService = {
  /**
   * Liste des utilisateurs
   * GET /admin/users?page=1&per_page=10
   */
  async list(page = 1, perPage = 10, options?: { role?: string; status?: string; search?: string }) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (options?.role) params.set("role", options.role);
    if (options?.status) params.set("status", options.status);
    if (options?.search) params.set("search", options.search);

    return get<PaginatedResponse<User>>(`/admin/users?${params.toString()}`);
  },

  /**
   * Récupère un utilisateur par ID
   * GET /admin/users/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<User>>(`/admin/users/${id}`);
  },

  /**
   * Crée un nouvel utilisateur (non supporté par le backend existant)
   */
  async create(data: CreateUserDTO) {
    return post<ApiResponse<User>>("/admin/users", data);
  },

  /**
   * Met à jour un utilisateur (non supporté directement, utiliser updateRole)
   */
  async update(id: number, data: UpdateUserDTO) {
    return put<ApiResponse<User>>(`/admin/users/${id}`, data);
  },

  /**
   * Supprime un utilisateur
   * DELETE /admin/users/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/users/${id}`);
  },

  /**
   * Change le rôle d'un utilisateur
   * PATCH /admin/users/{id}/role
   */
  async updateRole(id: number, role: string) {
    return put<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
  },

  async updateStatus(id: number, status: "active" | "inactive" | "banned") {
    return put<ApiResponse<User>>(`/admin/users/${id}/status`, { status });
  },

  async getActive(page = 1, perPage = 10) {
    return this.list(page, perPage, { status: "active" });
  },

  async export(format: "csv" | "json" = "csv") {
    return get<any>(`/admin/users/export?format=${format}`);
  },
};
