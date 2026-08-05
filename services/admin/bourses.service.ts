import { get, post, put, del } from "@/core/axios";
import type { Bourse, CreateBourseDTO, UpdateBourseDTO, PaginatedResponse, ApiResponse, StudyLevel, FieldOfStudy, ScholarshipType, Pays } from "@/types";

/**
 * Service pour la gestion des bourses (scholarships)
 * Endpoints admin: GET/POST /admin/scholarships, GET/PUT/DELETE /admin/scholarships/{id}
 */
export const boursesService = {
  /**
   * Liste paginée des bourses
   * GET /admin/scholarships?page=1&per_page=10&status=brouillon
   */
  async list(page = 1, perPage = 10, search?: string, status?: string) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    return get<PaginatedResponse<Bourse>>(`/admin/scholarships?${params.toString()}`);
  },

  /**
   * Récupère une bourse par ID
   * GET /admin/scholarships/{id}
   */
  async getById(id: number) {
    return get<ApiResponse<Bourse>>(`/admin/scholarships/${id}`);
  },

  /**
   * Crée une nouvelle bourse (avec FormData pour les fichiers)
   * POST /admin/scholarships
   */
  async create(data: CreateBourseDTO) {
    const fd = buildFormData(data);
    return post<ApiResponse<Bourse>>("/admin/scholarships", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Met à jour une bourse (avec FormData pour les fichiers)
   * PUT /admin/scholarships/{id}
   */
  async update(id: number, data: UpdateBourseDTO) {
    const fd = buildFormData(data);
    // Laravel ne supporte pas PUT avec multipart nativement → POST + _method=PUT
    fd.append("_method", "PUT");
    return post<ApiResponse<Bourse>>(`/admin/scholarships/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Supprime une bourse
   * DELETE /admin/scholarships/{id}
   */
  async delete(id: number) {
    return del<ApiResponse<{ message: string }>>(`/admin/scholarships/${id}`);
  },

  /**
   * Recherche rapide
   */
  async search(query: string) {
    return get<PaginatedResponse<Bourse>>(`/admin/scholarships?search=${encodeURIComponent(query)}`);
  },

  /**
   * Publier une bourse
   * PATCH /admin/scholarships/{id}/publish
   */
  async publish(id: number) {
    return post<ApiResponse<Bourse>>(`/admin/scholarships/${id}/publish`);
  },

  /**
   * Archiver une bourse
   * PATCH /admin/scholarships/{id}/archive
   */
  async archive(id: number) {
    return post<ApiResponse<Bourse>>(`/admin/scholarships/${id}/archive`);
  },

  // ─── Données de référence pour le formulaire ──────────────────────────

  /** GET /admin/study-levels */
  async getStudyLevels() {
    return get<StudyLevel[]>("/admin/study-levels");
  },

  /** GET /admin/fields-of-study */
  async getFieldsOfStudy() {
    return get<FieldOfStudy[]>("/admin/fields-of-study");
  },

  /** GET /admin/scholarship-types */
  async getScholarshipTypes() {
    return get<ScholarshipType[]>("/admin/scholarship-types");
  },

  /** GET /admin/countries */
  async getCountries() {
    return get<Pays[]>("/admin/countries");
  },
};

/**
 * Construit un FormData à partir du DTO bourse
 * Gère les fichiers (organism_logo, cover_image), les tableaux (study_level_ids, intakes), etc.
 */
function buildFormData(data: Record<string, any>): FormData {
  const fd = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      fd.append(key, value);
    } else if (key === "intakes" && Array.isArray(value)) {
      value.forEach((intake: any, i: number) => {
        Object.entries(intake).forEach(([field, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            fd.append(`intakes[${i}][${field}]`, String(val));
          }
        });
      });
    } else if (Array.isArray(value)) {
      // study_level_ids[], field_of_study_ids[], additional_info[]
      value.forEach((item, i) => {
        fd.append(`${key}[${i}]`, String(item));
      });
    } else if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else {
      fd.append(key, String(value));
    }
  });

  return fd;
}
