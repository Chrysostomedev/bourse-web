"use client";

import { useCallback, useState } from "react";
import { boursesService } from "@/services/admin/bourses.service";
import { normalizeList, normalizeItem } from "@/core/normalize";
import type { Bourse, CreateBourseDTO, UpdateBourseDTO, PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

type UseBoursesCrudReturn = {
  // State
  bourses: Bourse[];
  pagination: PaginatedResponse<Bourse>["meta"] | null;
  selectedBourse: Bourse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchBourses: (page?: number, perPage?: number, search?: string, status?: string) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreateBourseDTO) => Promise<Bourse>;
  update: (id: number, data: UpdateBourseDTO) => Promise<Bourse>;
  delete: (id: number) => Promise<void>;
  search: (query: string) => Promise<Bourse[]>;
  clearSelected: () => void;
  clearError: () => void;
};

export function useBoursesCrud(): UseBoursesCrudReturn {
  const [bourses, setBourses] = useState<Bourse[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Bourse>["meta"] | null>(null);
  const [selectedBourse, setSelectedBourse] = useState<Bourse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBourses = useCallback(
    async (page = 1, perPage = 10, search?: string, status?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await boursesService.list(page, perPage, search, status);
        const { data, meta } = normalizeList<Bourse>(response);
        setBourses(data);
        setPagination(meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors du chargement des bourses");
        console.error("[useBoursesCrud] fetchBourses error:", err);
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
      const response = await boursesService.getById(id);
      const item = normalizeItem<Bourse>(response);
      setSelectedBourse(item);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement de la bourse");
      console.error("[useBoursesCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateBourseDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await boursesService.create(data);
      const newItem = normalizeItem<Bourse>(response);
      setBourses((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateBourseDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await boursesService.update(id, data);
      const updated = normalizeItem<Bourse>(response);
      setBourses((prev) =>
        prev.map((b) => (b.id === id ? updated : b))
      );
      setSelectedBourse(updated);
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
      await boursesService.delete(id);
      setBourses((prev) => prev.filter((b) => b.id !== id));
      if (selectedBourse?.id === id) setSelectedBourse(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedBourse?.id]);

  const searchBourses = useCallback(async (query: string) => {
    setError(null);
    try {
      const response = await boursesService.search(query);
      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la recherche");
      throw err;
    }
  }, []);

  const clearSelected = useCallback(() => setSelectedBourse(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    bourses,
    pagination,
    selectedBourse,
    isLoading,
    isSaving,
    error,
    fetchBourses,
    fetchById,
    create,
    update,
    delete: deleteAction,
    search: searchBourses,
    clearSelected,
    clearError,
  };
}
