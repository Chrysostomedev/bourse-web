"use client";

import { useCallback, useEffect, useState } from "react";
import { authService, type AuthUser } from "@/services/auth.service";
import type { ApiError } from "@/core/error"; // adapte

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type UseAuthReturn = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** Étape 1 */
  requestOtp: (email: string, password: string) => Promise<void>;
  /** Étape 2 */
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hydratation au montage
  useEffect(() => {
    const stored = authService.getUser();
    if (stored && authService.getToken()) {
      setUser(stored);
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const requestOtp = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.requestOtp(email, password);
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.errorMessage ?? "Identifiants incorrects");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.verifyOtp(email, code);
      setUser(res.user);
      setStatus("authenticated");
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.errorMessage ?? "Code invalide ou expiré");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading,
    error,
    requestOtp,
    verifyOtp,
    logout,
    clearError,
  };
}