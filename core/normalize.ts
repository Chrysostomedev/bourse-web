/**
 * Normalise les réponses API qui peuvent être soit :
 *  - Un tableau direct :  [...items]
 *  - Une réponse paginée Laravel : { data: [...], meta: {...}, links: {...} }
 *  - Un wrapper simple :  { data: [...] }
 *
 * Retourne toujours { data: T[], meta: PaginationMeta | null }
 */
export function normalizeList<T>(response: any): { data: T[]; meta: any | null } {
  if (Array.isArray(response)) {
    return { data: response as T[], meta: null };
  }
  if (response && Array.isArray(response.data)) {
    return { data: response.data as T[], meta: response.meta ?? null };
  }
  return { data: [], meta: null };
}

/**
 * Normalise une réponse API pour un objet simple :
 *  - { data: {...} }  → retourne data
 *  - L'objet direct  → retourne l'objet
 */
export function normalizeItem<T>(response: any): T {
  if (response && response.data !== undefined && !Array.isArray(response.data)) {
    return response.data as T;
  }
  return response as T;
}
