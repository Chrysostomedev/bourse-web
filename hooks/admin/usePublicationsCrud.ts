"use client";

import { useCallback, useState } from "react";
import { publicationsService } from "@/services/admin/publications.service";
import { normalizeList, normalizeItem } from "@/core/normalize";
import type { Publication, CreatePublicationDTO, UpdatePublicationDTO, PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

type UsePublicationsCrudReturn = {
  // State
  publications: Publication[];
  pagination: PaginatedResponse<Publication>["meta"] | null;
  selectedPublication: Publication | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchPublications: (page?: number, perPage?: number, status?: "draft" | "published" | "archived", search?: string) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  fetchBySlug: (slug: string) => Promise<void>;
  create: (data: CreatePublicationDTO) => Promise<Publication>;
  update: (id: number, data: UpdatePublicationDTO) => Promise<Publication>;
  delete: (id: number) => Promise<void>;
  publish: (id: number) => Promise<Publication>;
  archive: (id: number) => Promise<Publication>;
  fetchPublished: (page?: number, perPage?: number) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
};

export function usePublicationsCrud(): UsePublicationsCrudReturn {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Publication>["meta"] | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = useCallback(
    async (page = 1, perPage = 10, status?: "draft" | "published" | "archived", search?: string, authorId?: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await publicationsService.list(page, perPage, status, search, authorId);
        const { data, meta } = normalizeList<Publication>(response);
        setPublications(data);
        setPagination(meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors du chargement des publications");
        console.error("[usePublicationsCrud] fetchPublications error:", err);
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
      const response = await publicationsService.getById(id);
      const item = normalizeItem<Publication>(response);
      setSelectedPublication(item);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement de la publication");
      console.error("[usePublicationsCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBySlug = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await publicationsService.getBySlug(slug);
      setSelectedPublication(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement de la publication");
      console.error("[usePublicationsCrud] fetchBySlug error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreatePublicationDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await publicationsService.create(data);
      const newItem = normalizeItem<Publication>(response);
      setPublications((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdatePublicationDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await publicationsService.update(id, data);
      const updated = normalizeItem<Publication>(response);
      setPublications((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      setSelectedPublication(updated);
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
      await publicationsService.delete(id);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      if (selectedPublication?.id === id) setSelectedPublication(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedPublication?.id]);

  const publishAction = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await publicationsService.publish(id);
      setPublications((prev) =>
        prev.map((p) => (p.id === id ? response.data : p))
      );
      setSelectedPublication(response.data);
      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la publication");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const archiveAction = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await publicationsService.archive(id);
      setPublications((prev) =>
        prev.map((p) => (p.id === id ? response.data : p))
      );
      setSelectedPublication(response.data);
      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de l'archivage");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const fetchPublished = useCallback(async (page = 1, perPage = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await publicationsService.getPublished(page, perPage);
      setPublications(response.data);
      setPagination(response.meta);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des publications");
      console.error("[usePublicationsCrud] fetchPublished error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelected = useCallback(() => setSelectedPublication(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    publications,
    pagination,
    selectedPublication,
    isLoading,
    isSaving,
    error,
    fetchPublications,
    fetchById,
    fetchBySlug,
    create,
    update,
    delete: deleteAction,
    publish: publishAction,
    archive: archiveAction,
    fetchPublished,
    clearSelected,
    clearError,
  };
}
