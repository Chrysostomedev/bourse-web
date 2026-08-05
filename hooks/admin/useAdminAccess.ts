"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "redacteur" | "user";

/**
 * Hook pour vérifier l'accès aux pages admin selon le rôle
 * Redirect automatique si accès refusé
 */
export function useAdminAccess(requiredRoles: Role[]) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Non authentifié
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Authentifié mais pas admin/rédacteur
    const userRole = (user?.role as Role) || "user";
    if (!requiredRoles.includes(userRole)) {
      router.push("/admin/dashboard");
      return;
    }
  }, [user, isAuthenticated, requiredRoles, router]);

  const hasAccess = isAuthenticated && user && requiredRoles.includes((user.role as Role) || "user");

  return {
    hasAccess,
    userRole: (user?.role as Role) || "user",
    isAdmin: user?.role === "admin",
    isRedacteur: user?.role === "redacteur",
  };
}

/**
 * Hook pour checker simplement si c'est un admin
 */
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === "admin";
}

/**
 * Hook pour checker si c'est un rédacteur
 */
export function useIsRedacteur() {
  const { user } = useAuth();
  return user?.role === "redacteur" || user?.role === "admin";
}
