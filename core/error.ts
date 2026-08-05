import { AxiosError } from "axios";

export type ApiError = {
    errorContent: any;
    errorMessage: string;
    statusCode: number | string | undefined;
    timestamp: string;
};

/**
 * Extrait le message lisible depuis la réponse d'erreur du backend.
 * Priorité :
 *   1. data.message                     (ex: "La tâche ne peut pas changer...")
 *   2. Premier message dans data.errors (ex: errors.id_task[0])
 *   3. Fallback générique par status code
 */
function extractBackendMessage(data: any): string | null {
    if (!data) return null;

    // 1. Champ message direct
    if (typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
    }

    // 2. Premier message dans errors (objet ou tableau)
    if (data.errors) {
        const errors = data.errors;
        // errors: { field: ["msg1", ...], ... }
        if (typeof errors === "object" && !Array.isArray(errors)) {
            const first = Object.values(errors)[0];
            if (Array.isArray(first) && typeof first[0] === "string") return first[0];
            if (typeof first === "string") return first;
        }
        // errors: ["msg1", "msg2"]
        if (Array.isArray(errors) && typeof errors[0] === "string") return errors[0];
    }

    return null;
}

const FALLBACK: Record<number, string> = {
    400: "Requête invalide. Vérifiez les données saisies.",
    401: "Session expirée. Veuillez vous reconnecter.",
    403: "Accès refusé. Permissions insuffisantes.",
    404: "Ressource introuvable.",
    409: "Conflit détecté.",
    422: "Données invalides. Corrigez les erreurs de validation.",
    429: "Trop de requêtes. Réessayez dans quelques instants.",
    500: "Erreur serveur. L'équipe technique a été notifiée.",
    502: "Service temporairement indisponible.",
    503: "Service en maintenance.",
};

/**
 * Détecte le cas particulier d'une réponse HTML (ex: page 404 par
 * défaut de Next.js) au lieu du JSON attendu du backend Laravel.
 * Signe quasi certain que la route de proxy elle-même est en cause,
 * pas l'API — utile pour ne pas chercher le bug côté Laravel pour rien.
 */
function isHtmlResponse(err: AxiosError): boolean {
    const contentType = err?.response?.headers?.["content-type"];
    return typeof contentType === "string" && contentType.includes("text/html");
}

/**
 * Normalise une erreur Axios en objet ApiError typé.
 * Affiche en priorité le message exact renvoyé par le backend.
 */
export const processApiError = (err: AxiosError): never => {
    const data       = err?.response?.data as any;
    const status     = err?.response?.status;
    const backendMsg = extractBackendMessage(data);

    const errorRes: ApiError = {
        errorContent: data,
        errorMessage:
            backendMsg ??
            (status ? (FALLBACK[status] ?? `Erreur ${status}: ${err.message}`) : ""),
        statusCode: status,
        timestamp:  new Date().toISOString(),
    };

    if (!status) {
        if (err.code === "ERR_NETWORK") {
            errorRes.errorMessage = "Problème de connexion réseau. Vérifiez votre connexion Internet.";
        } else if (err.code === "ECONNABORTED") {
            errorRes.errorMessage = "Délai d'attente dépassé. Le serveur met trop de temps à répondre.";
        } else {
            errorRes.errorMessage = err.message ?? "Une erreur inattendue s'est produite. Réessayez.";
        }
    } else if (!backendMsg && isHtmlResponse(err)) {
        // Pas de message JSON + réponse HTML = la requête n'a probablement
        // jamais atteint Laravel (route de proxy manquante/mal configurée,
        // mauvais chemin d'API, etc).
        errorRes.errorMessage = `Route API introuvable ou proxy mal configuré (${status}). La réponse n'est pas du JSON.`;
    }

    const isSilent = (err?.config as any)?.silent === true;

    if (process.env.NODE_ENV === "development" && !isSilent) {
        console.group("API Error");
        console.error("URL:",    err?.config?.url);
        console.error("Method:", err?.config?.method?.toUpperCase());
        console.error("Status:", status);
        console.error("Data:",   data);
        console.error("→ Msg:",  errorRes.errorMessage);
        console.groupEnd();
    }

    throw errorRes;
};