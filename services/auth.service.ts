import { post } from "@/core/axios"; // adapte le chemin
import { setCookie, deleteCookie, getCookie } from "cookies-next";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "redacteur" | "user";
  // ajoute d'autres champs selon ton UserResource
};

type LoginResponse = {
  user: AuthUser;
  token: string;
};

type RequestOtpResponse = {
  message: string;
};

const TOKEN_KEY = "authToken";
const USER_KEY = "user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

/**
 * ⚠️ Point de vigilance : ces deux endpoints supposent que ton client
 * axios (post()) préfixe déjà l'URL avec le bon chemin d'API — par ex.
 * baseURL = "/proxy" doit lui-même relayer vers
 * "<backend>/api/v1/admin/login", pas juste "<backend>/admin/login".
 * Si tu obtiens un 404 avec Content-Type: text/html, le problème est
 * dans cette route de proxy (souvent app/api/proxy/[...path]/route.ts),
 * pas ici.
 */
export const authService = {
  /**
   * Étape 1 — envoie l'OTP par email (admin/rédacteur uniquement)
   * POST /admin/login
   */
  async requestOtp(email: string, password: string): Promise<RequestOtpResponse> {
    return post<RequestOtpResponse>("/admin/login", { email, password });
  },

  /**
   * Étape 2 — vérifie le code et récupère user + token
   * POST /admin/login/verify
   */
  async verifyOtp(email: string, code: string): Promise<LoginResponse> {
    const res = await post<LoginResponse>("/admin/login/verify", {
      email,
      code,
    });

    setCookie(TOKEN_KEY, res.token, { maxAge: COOKIE_MAX_AGE });
    setCookie(USER_KEY, JSON.stringify(res.user), { maxAge: COOKIE_MAX_AGE });

    return res;
  },

  logout() {
    deleteCookie(TOKEN_KEY);
    deleteCookie(USER_KEY);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  getToken(): string | undefined {
    const value = getCookie(TOKEN_KEY);
    return typeof value === "string" ? value : undefined;
  },

  getUser(): AuthUser | null {
    const raw = getCookie(USER_KEY);
    if (!raw || typeof raw !== "string") return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      // Cookie corrompu/tronqué : on nettoie plutôt que de renvoyer
      // un objet invalide silencieusement.
      deleteCookie(USER_KEY);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};