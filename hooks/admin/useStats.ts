"use client";

import { useCallback, useState } from "react";
import { statsService } from "@/services/admin/stats.service";
import type { StatsOverview, ApiError } from "@/core/error";

export type StatsMonthly = {
  new_users: number;
  new_applications: number;
  new_bourses: number;
  chart_data: Array<{ date: string; count: number }>;
};

export type UsersByCountry = Array<{ country: string; count: number }>;

export type TopBourse = {
  id: number;
  title: string;
  views: number;
  applications: number;
};

export type ActivityDay = {
  date: string;
  users_registered: number;
  applications_submitted: number;
  bourses_created: number;
};

type UseStatsReturn = {
  // State
  overview: StatsOverview | null;
  monthly: StatsMonthly | null;
  usersByCountry: UsersByCountry | null;
  topBourses: TopBourse[] | null;
  activity: ActivityDay[] | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOverview: () => Promise<void>;
  fetchMonthly: () => Promise<void>;
  fetchUsersByCountry: () => Promise<void>;
  fetchTopBourses: (limit?: number) => Promise<void>;
  fetchActivity: (days?: number) => Promise<void>;
  fetchAll: () => Promise<void>;
  clearError: () => void;
};

export function useStats(): UseStatsReturn {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [monthly, setMonthly] = useState<StatsMonthly | null>(null);
  const [usersByCountry, setUsersByCountry] = useState<UsersByCountry | null>(null);
  const [topBourses, setTopBourses] = useState<TopBourse[] | null>(null);
  const [activity, setActivity] = useState<ActivityDay[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setError(null);
    try {
    // useStats.ts
const response = await statsService.getOverview();
setOverview(response); // pas response.data
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des stats");
      console.error("[useStats] fetchOverview error:", err);
    }
  }, []);

  const fetchMonthly = useCallback(async () => {
    setError(null);
    try {
      const response = await statsService.getMonthly();
      setMonthly(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des stats mensuelles");
      console.error("[useStats] fetchMonthly error:", err);
    }
  }, []);

  const fetchUsersByCountry = useCallback(async () => {
    setError(null);
    try {
      const response = await statsService.getUsersByCountry();
      setUsersByCountry(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des stats par pays");
      console.error("[useStats] fetchUsersByCountry error:", err);
    }
  }, []);

  const fetchTopBourses = useCallback(async (limit = 10) => {
    setError(null);
    try {
      const response = await statsService.getTopBourses(limit);
      setTopBourses(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des top bourses");
      console.error("[useStats] fetchTopBourses error:", err);
    }
  }, []);

  const fetchActivity = useCallback(async (days = 30) => {
    setError(null);
    try {
      const response = await statsService.getActivity(days);
      setActivity(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement de l'activité");
      console.error("[useStats] fetchActivity error:", err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchMonthly(),
        fetchUsersByCountry(),
        fetchTopBourses(),
        fetchActivity(),
      ]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.errorMessage ?? "Erreur lors du chargement des stats");
      console.error("[useStats] fetchAll error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOverview, fetchMonthly, fetchUsersByCountry, fetchTopBourses, fetchActivity]);

  const clearError = useCallback(() => setError(null), []);

  return {
    overview,
    monthly,
    usersByCountry,
    topBourses,
    activity,
    isLoading,
    error,
    fetchOverview,
    fetchMonthly,
    fetchUsersByCountry,
    fetchTopBourses,
    fetchActivity,
    fetchAll,
    clearError,
  };
}
