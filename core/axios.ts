import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getCookie } from "cookies-next";
import { processApiError } from "./error";

declare module "axios" {
    export interface AxiosRequestConfig {
        silent?: boolean;
    }
}
/**
 * baseURL = NEXT_PUBLIC_API_URL = "/proxy" en dev et prod.
 *
 * Le browser envoie ses requêtes vers /proxy/... (même origine → zéro CORS).
 * Next.js redirige côté serveur vers le vrai backend (serveur→serveur → zéro CORS).
 *
 * En cas d'URL absolue dans .env (ancienne config), on la conserve pour la
 * compatibilité mais le CORS sera géré par le backend.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/proxy";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20_000,
    // withCredentials: false — pas nécessaire via proxy same-origin
    // Si ton backend utilise des cookies de session, remets-le à true
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// ── Routes publiques (pas de token Bearer) ────────────────────────────────────
const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/login/verify",
];

const isPublicRoute = (url?: string): boolean =>
    !url ? false : PUBLIC_PATHS.some((p) => url.includes(p));

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Don't set Content-Type for FormData - let axios handle it
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        
        if (!isPublicRoute(config.url)) {
            const token = getCookie("authToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof document !== "undefined") {
                ["authToken", "user"].forEach((name) => {
                    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                });
            }
            if (
                typeof window !== "undefined" &&
                !window.location.pathname.includes("/login")
            ) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// ── Retry ─────────────────────────────────────────────────────────────────────
interface RetryConfig {
    maxRetries: number;
    retryDelay: number; // ms, multiplié par le nb de tentatives
    retryOn:    number[];
}

const defaultRetry: RetryConfig = {
    maxRetries: 2,
    retryDelay: 1500,
    retryOn:    [408, 429, 500, 502, 503, 504],
};

async function withRetry<T>(
    fn: () => Promise<T>,
    cfg: Partial<RetryConfig> = {}
): Promise<T> {
    const c = { ...defaultRetry, ...cfg };
    let attempts = 0;

    const run = async (): Promise<T> => {
        try {
            return await fn();
        } catch (err) {
            const axiosErr = err as AxiosError;
            const shouldRetry =
                attempts < c.maxRetries &&
                (axiosErr.response
                    ? c.retryOn.includes(axiosErr.response.status)
                    : ["ECONNABORTED", "ERR_NETWORK"].includes(axiosErr.code ?? ""));

            if (shouldRetry) {
                attempts++;
                await new Promise((r) => setTimeout(r, c.retryDelay * attempts));
                return run();
            }
            throw err;
        }
    };

    return run();
}

// ── Response / error processors ───────────────────────────────────────────────
const handleSuccess = (res: AxiosResponse) => {
    if (res.status >= 200 && res.status < 300) return res.data;
    throw res.data;
};

// ── HTTP helpers ──────────────────────────────────────────────────────────────
export const get = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
  retry?: Partial<RetryConfig>
): Promise<T> =>
  withRetry(() => api.get(url, config).then(handleSuccess), retry)
    .catch(processApiError);

export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  retry?: Partial<RetryConfig>
): Promise<T> =>
  withRetry(() => api.post(url, data, config).then(handleSuccess), retry)
    .catch(processApiError);

export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  retry?: Partial<RetryConfig>
): Promise<T> =>
  withRetry(() => api.put(url, data, config).then(handleSuccess), retry)
    .catch(processApiError);

export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  retry?: Partial<RetryConfig>
): Promise<T> =>
  withRetry(() => api.patch(url, data, config).then(handleSuccess), retry)
    .catch(processApiError);

export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
  retry?: Partial<RetryConfig>
): Promise<T> =>
  withRetry(() => api.delete(url, config).then(handleSuccess), retry)
    .catch(processApiError);
    
export default api;
