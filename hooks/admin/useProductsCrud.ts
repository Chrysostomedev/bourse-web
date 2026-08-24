"use client";

import { useCallback, useState } from "react";
import { productsService } from "@/services/admin/products.service";
import { normalizeList, normalizeItem } from "@/core/normalize";
import type { PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

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

type UseProductsCrudReturn = {
  // State
  products: Product[];
  pagination: PaginatedResponse<Product>["meta"] | null;
  selectedProduct: Product | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchProducts: (page?: number, perPage?: number, search?: string) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreateProductDTO) => Promise<Product>;
  update: (id: number, data: UpdateProductDTO) => Promise<Product>;
  delete: (id: number) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
};

export function useProductsCrud(): UseProductsCrudReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Product>["meta"] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (page = 1, perPage = 10, search?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productsService.list(page, perPage, search);
        const { data, meta } = normalizeList<Product>(response);
        setProducts(data);
        setPagination(meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors du chargement des produits");
        console.error("[useProductsCrud] fetchProducts error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productsService.getById(id);
      const item = normalizeItem<Product>(response);
      setSelectedProduct(item);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement du produit");
      console.error("[useProductsCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateProductDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await productsService.create(data);
      const newItem = normalizeItem<Product>(response);
      setProducts((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateProductDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await productsService.update(id, data);
      const updated = normalizeItem<Product>(response);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      setSelectedProduct(updated);
      return updated;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la mise à jour");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteAction = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    try {
      await productsService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedProduct?.id]);

  const clearSelected = useCallback(() => setSelectedProduct(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    products,
    pagination,
    selectedProduct,
    isLoading,
    isSaving,
    error,
    fetchProducts,
    fetchById,
    create,
    update,
    delete: deleteAction,
    clearSelected,
    clearError,
  };
}
