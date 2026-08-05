"use client";

import { useCallback, useState } from "react";
import { partenairesService } from "@/services/admin/partenaires.service";
import { normalizeList, normalizeItem } from "@/core/normalize";
import type { Partenaire, CreatePartenairesDTO, UpdatePartenairesDTO, PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

type UsePartenairersCrudReturn = {
  // State
  partenaires: Partenaire[];
  pagination: PaginatedResponse<Partenaire>["meta"] | null;
  selectedPartenaire: Partenaire | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchPartenaires: (page?: number, perPage?: number, search?: string, status?: string) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreatePartenairesDTO) => Promise<Partenaire>;
  update: (id: number, data: UpdatePartenairesDTO) => Promise<Partenaire>;
  delete: (id: number) => Promise<void>;
  fetchActive: () => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
};

export function usePartenairersCrud(): UsePartenairersCrudReturn {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Partenaire>["meta"] | null>(null);
  const [selectedPartenaire, setSelectedPartenaire] = useState<Partenaire | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartenaires = useCallback(
    async (page = 1, perPage = 10, search?: string, status?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await partenairesService.list(page, perPage, search, status);
        const { data, meta } = normalizeList<Partenaire>(response);
        setPartenaires(data);
        setPagination(meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors du chargement des partenaires");
        console.error("[usePartenairersCrud] fetchPartenaires error:", err);
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
      const response = await partenairesService.getById(id);
      const item = normalizeItem<Partenaire>(response);
      setSelectedPartenaire(item);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement du partenaire");
      console.error("[usePartenairersCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreatePartenairesDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await partenairesService.create(data);
      const newItem = normalizeItem<Partenaire>(response);
      setPartenaires((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdatePartenairesDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await partenairesService.update(id, data);
      const updated = normalizeItem<Partenaire>(response);
      setPartenaires((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      setSelectedPartenaire(updated);
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
      await partenairesService.delete(id);
      setPartenaires((prev) => prev.filter((p) => p.id !== id));
      if (selectedPartenaire?.id === id) setSelectedPartenaire(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedPartenaire?.id]);

  const fetchActive = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await partenairesService.getActive();
      const { data } = normalizeList<Partenaire>(response);
      setPartenaires(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des partenaires");
      console.error("[usePartenairersCrud] fetchActive error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelected = useCallback(() => setSelectedPartenaire(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    partenaires,
    pagination,
    selectedPartenaire,
    isLoading,
    isSaving,
    error,
    fetchPartenaires,
    fetchById,
    create,
    update,
    delete: deleteAction,
    fetchActive,
    clearSelected,
    clearError,
  };
}
