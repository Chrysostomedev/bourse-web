import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES  = ["/login", "/login/password"];
/** Routes accessibles à tout utilisateur authentifié, quel que soit son rôle */
const SHARED_ROUTES  = ["/profil", "/faq"];

/**
 * Les 3 rôles réels du backend Laravel — pas de SUPER_ADMIN, ce rôle
 * n'existe pas dans notre schéma (users.role : admin | redacteur | user).
 */
type Role = "admin" | "redacteur" | "user";

/** Normalise une chaîne de rôle arbitraire (casse, accents...) vers un Role connu. */
function normalizeRole(raw: string | null): Role {
    const value = (raw ?? "").trim().toLowerCase();

    if (value === "admin") return "admin";
    if (value === "redacteur" || value === "rédacteur") return "redacteur";

    return "user";
}

/** Où renvoyer l'utilisateur après connexion, selon son rôle. */
function getHomeForRole(role: Role): string {
    return role === "admin" || role === "redacteur" ? "/admin" : "/user";
}

/** Préfixe de routes auquel ce rôle a droit (hors routes partagées). */
function getAllowedPrefix(role: Role): string {
    return role === "admin" || role === "redacteur" ? "/admin" : "/user";
}

/** Extrait le rôle brut depuis le cookie "user", quelle que soit sa forme
 *  ( roles: string[] | roles: [{name}] | role: {name} ), gère l'URL-encoding. */
function extractRawRole(userRaw: string): string | null {
    try {
        let raw = userRaw;
        if (raw.includes("%")) {
            try { raw = decodeURIComponent(raw); } catch { /* garde la valeur brute */ }
        }
        const user = JSON.parse(raw);

        if (Array.isArray(user?.roles) && user.roles.length > 0) {
            const first = user.roles[0];
            return typeof first === "string" ? first : first?.name ?? null;
        }
        if (user?.role?.name) return String(user.role.name);
        if (typeof user?.role === "string") return user.role;
        return null;
    } catch {
        return null;
    }
}

/**
 * Nom `proxy` requis par Next.js 16 pour ce fichier racine (ex-middleware.ts).
 * Ne pas confondre avec app/proxy/[...path]/route.ts, qui relaie les
 * appels vers le backend Laravel — mécanisme distinct, même mot par
 * coïncidence de nommage.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/proxy") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/_vercel") ||
        /\.(?:jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2?|ttf|otf|map)$/.test(pathname)
    ) {
        return NextResponse.next();
    }

    const token    = request.cookies.get("authToken")?.value;
    const userRaw  = request.cookies.get("user")?.value;
    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    // Déjà authentifié sur une page publique (ex: /login) → renvoyer vers son espace
    if (token && isPublic) {
        const role = normalizeRole(userRaw ? extractRawRole(userRaw) : null);
        return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
    }

    // Non authentifié sur une route protégée → login
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Cloisonnement : admin/redacteur → /admin/*, user → /user/*
    // Les routes partagées (/profil, /faq…) sont accessibles à tous les rôles
    if (token && userRaw && !isPublic) {
        const role          = normalizeRole(extractRawRole(userRaw));
        const allowedPrefix = getAllowedPrefix(role);
        const isShared      = SHARED_ROUTES.some((r) => pathname.startsWith(r));

        if (!isShared && !pathname.startsWith(allowedPrefix)) {
            return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};