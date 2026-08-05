"use client";

import { useCallback, useState } from "react";
import { paysService } from "@/services/admin/pays.service";
import { normalizeList, normalizeItem } from "@/core/normalize";
import type { Pays, CreatePaysDTO, UpdatePaysDTO, PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

type UsePaysCrudReturn = {
  // State
  pays: Pays[];
  pagination: PaginatedResponse<Pays>["meta"] | null;
  selectedPays: Pays | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchPays: (page?: number, perPage?: number, search?: string) => Promise<void>;
  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreatePaysDTO) => Promise<Pays>;
  update: (id: number, data: UpdatePaysDTO) => Promise<Pays>;
  delete: (id: number) => Promise<void>;
  fetchActive: () => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
};

export function usePaysCrud(): UsePaysCrudReturn {
  const [pays, setPays] = useState<Pays[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Pays>["meta"] | null>(null);
  const [selectedPays, setSelectedPays] = useState<Pays | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPays = useCallback(
    async (page = 1, perPage = 20, search?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await paysService.list(page, perPage, search);
        const { data, meta } = normalizeList<Pays>(response);
        setPays(data);
        setPagination(meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage?? "Erreur lors du chargement des pays");
        console.error("[usePaysCrud] fetchPays error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paysService.getAll();
      const { data } = normalizeList<Pays>(response);
      setPays(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage?? "Erreur lors du chargement des pays");
      console.error("[usePaysCrud] fetchAll error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paysService.getById(id);
      const item = normalizeItem<Pays>(response);
      setSelectedPays(item);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage?? "Erreur lors du chargement du pays");
      console.error("[usePaysCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreatePaysDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await paysService.create(data);
      const newItem = normalizeItem<Pays>(response);
      setPays((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdatePaysDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await paysService.update(id, data);
      const updated = normalizeItem<Pays>(response);
      setPays((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setSelectedPays(updated);
      return updated;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage?? "Erreur lors de la mise à jour");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteAction = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    try {
      await paysService.delete(id);
      setPays((prev) => (prev?? []).filter((p) => p.id!== id));
      if (selectedPays?.id === id) setSelectedPays(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedPays?.id]);

  const fetchActive = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paysService.getActive();
      const { data } = normalizeList<Pays>(response);
      setPays(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage?? "Erreur lors du chargement des pays");
      console.error("[usePaysCrud] fetchActive error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelected = useCallback(() => setSelectedPays(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    pays,
    pagination,
    selectedPays,
    isLoading,
    isSaving,
    error,
    fetchPays,
    fetchAll,
    fetchById,
    create,
    update,
    delete: deleteAction,
    fetchActive,
    clearSelected,
    clearError,
  };
}