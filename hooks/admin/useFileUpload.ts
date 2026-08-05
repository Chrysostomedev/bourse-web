"use client";

import { useCallback, useState } from "react";
import { post } from "@/core/axios";
import type { ApiError } from "@/core/error";

export type FileUploadResponse = {
  url: string;
  name: string;
  size: number;
  mime_type: string;
};

type UseFileUploadReturn = {
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File, endpoint?: string) => Promise<FileUploadResponse>;
  uploadMultiple: (files: File[], endpoint?: string) => Promise<FileUploadResponse[]>;
  clearError: () => void;
};

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, endpoint = "/upload") => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await post<{ data: FileUploadResponse }>(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError?.errorMessage ?? "Erreur lors de l'upload du fichier";
      setError(errorMsg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadMultiple = useCallback(async (files: File[], endpoint = "/upload") => {
    setIsUploading(true);
    setError(null);

    try {
      const responses = await Promise.all(
        files.map((file) => uploadFile(file, endpoint))
      );
      return responses;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError?.errorMessage ?? "Erreur lors de l'upload des fichiers";
      setError(errorMsg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isUploading,
    error,
    uploadFile,
    uploadMultiple,
    clearError,
  };
}
