import { get, post, put, del } from "@/core/axios";
import type { Publication, CreatePublicationDTO, UpdatePublicationDTO, PaginatedResponse, ApiResponse } from "@/types";

/**
 * Service pour la gestion des publications (posts)
 * Endpoints réels: GET/POST /admin/posts, GET/PUT/DELETE /admin/posts/{id}, PATCH /admin/posts/{id}/publish|archive
 */
export const publicationsService = {
  /**
   * Liste paginée des publications
   * GET /admin/posts?page=1&per_page=10
   */
  async list(page = 1, perPage = 10, status?: "draft" | "published" | "archived", search?: string, authorId?: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (authorId) params.set("author_id", String(authorId));

    return get<PaginatedResponse<Publication>>(`/admin/posts?${params.toString()}`);
  },

  /**
   * Récupère une publication par ID
   * GET /admin/posts/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<Publication>>(`/admin/posts/${id}`);
  },

  /**
   * Crée une nouvelle publication
   * POST /admin/posts
   */
  async create(data: CreatePublicationDTO) {
    return post<ApiResponse<Publication>>("/admin/posts", data);
  },

  /**
   * Met à jour une publication
   * PUT /admin/posts/{id}
   */
  async update(id: number, data: UpdatePublicationDTO) {
    return put<ApiResponse<Publication>>(`/admin/posts/${id}`, data);
  },

  /**
   * Supprime une publication
   * DELETE /admin/posts/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/posts/${id}`);
  },

  /**
   * Publie une publication (change son statut)
   * PATCH /admin/posts/{id}/publish
   */
  async publish(id: number) {
    return post<ApiResponse<Publication>>(`/admin/posts/${id}/publish`, {});
  },

  /**
   * Archive une publication
   * PATCH /admin/posts/{id}/archive
   */
  async archive(id: number) {
    return post<ApiResponse<Publication>>(`/admin/posts/${id}/archive`, {});
  },

  async getBySlug(slug: string) {
    return get<ApiResponse<Publication>>(`/admin/posts/slug/${slug}`);
  },

  async getPublished(page = 1, perPage = 10) {
    return this.list(page, perPage, "published");
  },
};
