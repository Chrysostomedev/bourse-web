import { type NextRequest, NextResponse } from "next/server";

/**
 * Proxy générique : /proxy/admin/login  →  ${NEXT_PUBLIC_BACKEND_URL}/admin/login
 *
 * Défini dans .env.local :
 *   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000/api/v1
 *
 * (le préfixe /api/v1 doit correspondre à routes/api/v1/public.php et
 * admin.php côté Laravel — confirmé par `php artisan route:list`)
 *
 * Pourquoi passer par ce proxy plutôt qu'appeler Laravel directement
 * depuis le navigateur : évite les soucis CORS, et permet de garder le
 * token hors du JS client (lu ici côté serveur depuis le cookie).
 *
 * Runtime "nodejs" obligatoire (pas "edge") : on a besoin de `duplex`
 * pour relayer un body en streaming (utile pour les uploads de fichiers
 * multipart — logos, covers, e-books).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000/api/v1";

// En-têtes qui ne doivent JAMAIS être relayés tels quels — soit parce
// qu'ils sont spécifiques à la connexion HTTP locale (host, connection),
// soit parce qu'on les régénère nous-mêmes (Authorization, cookie).
const STRIPPED_REQUEST_HEADERS = ["host", "connection", "content-length", "cookie"];
const STRIPPED_RESPONSE_HEADERS = ["content-encoding", "transfer-encoding", "connection"];

async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const targetUrl = `${BACKEND_API_URL}/${path.join("/")}${request.nextUrl.search}`;

    const headers = new Headers(request.headers);
    STRIPPED_REQUEST_HEADERS.forEach((h) => headers.delete(h));

    // Injecte le token Sanctum depuis le cookie httpOnly — le front n'a
    // jamais besoin de le connaître explicitement pour chaque requête.
    const token = request.cookies.get("authToken")?.value;
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Force Laravel à répondre en JSON (évite un comportement de
    // redirection web classique sur une erreur de validation).
    if (!headers.has("accept")) {
        headers.set("accept", "application/json");
    }

    const hasBody = !["GET", "HEAD"].includes(request.method);

    try {
        const backendResponse = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: hasBody ? request.body : undefined,
            // @ts-expect-error -- requis par undici pour un body en streaming
            duplex: hasBody ? "half" : undefined,
            cache: "no-store",
        });

        const responseHeaders = new Headers(backendResponse.headers);
        STRIPPED_RESPONSE_HEADERS.forEach((h) => responseHeaders.delete(h));

        return new NextResponse(backendResponse.body, {
            status: backendResponse.status,
            headers: responseHeaders,
        });
    } catch (error) {
        // Le backend est injoignable (arrêté, mauvaise URL, réseau) —
        // on renvoie un vrai JSON plutôt que de laisser Next afficher
        // sa page d'erreur HTML (exactement le piège qu'on vient de
        // déboguer : un 404/500 HTML au lieu d'un JSON exploitable).
        console.error("[proxy] Échec de connexion au backend:", targetUrl, error);

        return NextResponse.json(
            {
                message: "Impossible de joindre le serveur. Vérifie que le backend Laravel tourne bien.",
            },
            { status: 502 }
        );
    }
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
};