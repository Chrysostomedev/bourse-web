"use client";

import { useCallback, useState } from "react";
import { usersService } from "@/services/admin/users.service";
import type { User, CreateUserDTO, UpdateUserDTO, PaginatedResponse } from "@/types";
import type { ApiError } from "@/core/error";

type UseUsersCrudReturn = {
  // State
  users: User[];
  pagination: PaginatedResponse<User>["meta"] | null;
  selectedUser: User | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchUsers: (page?: number, perPage?: number, options?: { role?: string; status?: string; search?: string }) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: CreateUserDTO) => Promise<User>;
  update: (id: number, data: UpdateUserDTO) => Promise<User>;
  delete: (id: number) => Promise<void>;
  updateStatus: (id: number, status: "active" | "inactive" | "banned") => Promise<User>;
  fetchActive: (page?: number, perPage?: number) => Promise<void>;
  export: (format?: "csv" | "json") => Promise<Blob>;
  clearSelected: () => void;
  clearError: () => void;
};

export function useUsersCrud(): UseUsersCrudReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<User>["meta"] | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page = 1, perPage = 10, options?: { role?: string; status?: string; search?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await usersService.list(page, perPage, options);
        setUsers(response.data);
        setPagination(response.meta);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors du chargement des utilisateurs");
        console.error("[useUsersCrud] fetchUsers error:", err);
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
      const response = await usersService.getById(id);
      setSelectedUser(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement de l'utilisateur");
      console.error("[useUsersCrud] fetchById error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateUserDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await usersService.create(data);
      setUsers((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la création");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateUserDTO) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await usersService.update(id, data);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? response.data : u))
      );
      setSelectedUser(response.data);
      return response.data;
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
      await usersService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedUser?.id]);

  const updateStatusAction = useCallback(
    async (id: number, status: "active" | "inactive" | "banned") => {
      setIsSaving(true);
      setError(null);
      try {
        const response = await usersService.updateStatus(id, status);
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? response.data : u))
        );
        setSelectedUser(response.data);
        return response.data;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError?.errorMessage ?? "Erreur lors de la mise à jour du statut");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const fetchActive = useCallback(async (page = 1, perPage = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.getActive(page, perPage);
      setUsers(response.data);
      setPagination(response.meta);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des utilisateurs");
      console.error("[useUsersCrud] fetchActive error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportUsers = useCallback(async (format: "csv" | "json" = "csv") => {
    setError(null);
    try {
      return await usersService.export(format);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors de l'export");
      throw err;
    }
  }, []);

  const clearSelected = useCallback(() => setSelectedUser(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    users,
    pagination,
    selectedUser,
    isLoading,
    isSaving,
    error,
    fetchUsers,
    fetchById,
    create,
    update,
    delete: deleteAction,
    updateStatus: updateStatusAction,
    fetchActive,
    export: exportUsers,
    clearSelected,
    clearError,
  };
}
