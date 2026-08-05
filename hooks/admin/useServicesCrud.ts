"use client";

import { useCallback, useState } from "react";
import { servicesService } from "@/services/admin/services.service";
import { normalizeList, normalizeItem } from "@/core/normalize";
import type { Service, CreateServiceDTO, UpdateServiceDTO, PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

type UseServicesCrudReturn = {
  // State
  services: Service[];
  pagination: PaginatedResponse<Service>["meta"] | null;
  selectedService: Service | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchServices: (page?: number, perPage?: number, search?: string) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreateServiceDTO) => Promise<Service>;
  update: (id: number, data: UpdateServiceDTO) => Promise<Service>;
  delete: (id: number) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
};

export function useServicesCrud(): UseServicesCrudReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Service>["meta"] | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(
    async (page = 1, perPage = 10, search?: string, status?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await servicesService.list(page, perPage, search, status);
        // Response can be paginated or non-paginated, normalize both cases
        const data = Array.isArray(response) ? response : (response as any)?.data || [];
        const meta = (response as any)?.meta || null;
        setServices(data);
        setPagination(meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors du chargement des services");
        console.error("[useServicesCrud] fetchServices error:", err);
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
      const response = await servicesService.getById(id);
      const item = normalizeItem<Service>(response);
      setSelectedService(item);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement du service");
      console.error("[useServicesCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateServiceDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await servicesService.create(data);
      const newItem = normalizeItem<Service>(response);
      setServices((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateServiceDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await servicesService.update(id, data);
      const updated = normalizeItem<Service>(response);
      setServices((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      setSelectedService(updated);
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
      await servicesService.delete(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      if (selectedService?.id === id) setSelectedService(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedService?.id]);

  const clearSelected = useCallback(() => setSelectedService(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    services,
    pagination,
    selectedService,
    isLoading,
    isSaving,
    error,
    fetchServices,
    fetchById,
    create,
    update,
    delete: deleteAction,
    clearSelected,
    clearError,
  };
}
