import { get, post, put, del } from "@/core/axios";
import type { PaginatedResponse, ApiResponse } from "@/types";

export interface Product {
  id: number;
  title: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateProductDTO = Omit<Product, "id" | "created_at" | "updated_at">;
export type UpdateProductDTO = Partial<CreateProductDTO>;

/**
 * Service pour la gestion des produits
 * Endpoints réels: GET/POST /admin/products, GET/PUT/DELETE /admin/products/{id}
 */
export const productsService = {
  /**
   * Liste paginée des produits
   * GET /admin/products?page=1&per_page=10
   */
  async list(page = 1, perPage = 10, search?: string) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (search) params.set("q", search);

    return get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
  },

  /**
   * Récupère tous les produits (non paginé)
   * GET /admin/products
   */
  async getAll() {
    return get<{ data: Product[] }>("/admin/products");
  },

  /**
   * Récupère un produit par ID
   * GET /admin/products/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<Product>>(`/admin/products/${id}`);
  },

  /**
   * Crée un nouveau produit
   * POST /admin/products
   */
  async create(data: CreateProductDTO) {
    return post<ApiResponse<Product>>("/admin/products", data);
  },

  /**
   * Met à jour un produit
   * PUT /admin/products/{id}
   */
  async update(id: number, data: UpdateProductDTO) {
    return put<ApiResponse<Product>>(`/admin/products/${id}`, data);
  },

  /**
   * Supprime un produit
   * DELETE /admin/products/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/products/${id}`);
  },
};
