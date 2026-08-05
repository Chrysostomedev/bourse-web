/**
 * Types centralisés pour le back-office admin
 * Synchronisé avec les modèles/ressources Laravel
 */

// ─── Auth ─────────────────────────────────────────────────────────────
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "redacteur" | "user";
  avatar?: string;
  created_at?: string;
  updated_at?: string;
};

// ─── Pagination ───────────────────────────────────────────────────────
export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

// ─── Bourses (Scholarships) ───────────────────────────────────────────
export type BourseIntake = {
  id?: number;
  intake_label: string;
  period_start?: string;
  period_end?: string;
  period_label_text?: string;
};

export type StudyLevel = {
  id: number;
  name: string;
};

export type FieldOfStudy = {
  id: number;
  name: string;
};

export type ScholarshipType = {
  id: number;
  name: string;
};

export type Bourse = {
  id: number;
  title: string;
  slug?: string;
  organism_name: string;
  organism_logo?: string;
  country_id?: number;
  country?: { id: number; name: string; flag_emoji?: string };
  scholarship_type_id?: number;
  scholarship_type?: ScholarshipType;
  funding_type: "partielle" | "totale";
  objective: string;
  conditions: string;
  advantages: string;
  additional_info?: string[];
  official_link?: string;
  cover_image?: string;
  status: "brouillon" | "publie" | "archive";
  is_featured?: boolean;
  study_levels?: StudyLevel[];
  fields_of_study?: FieldOfStudy[];
  intakes?: BourseIntake[];
  // Computed / read-only
  days_remaining?: number;
  created_at?: string;
  updated_at?: string;
};

export type CreateBourseDTO = {
  title: string;
  organism_name: string;
  organism_logo?: File | null;
  country_id?: number;
  scholarship_type_id?: number;
  funding_type: "partielle" | "totale";
  objective: string;
  conditions: string;
  advantages: string;
  additional_info?: string[];
  official_link?: string;
  cover_image?: File | null;
  status: "brouillon" | "publie" | "archive";
  is_featured?: boolean;
  study_level_ids: number[];
  field_of_study_ids: number[];
  intakes: Omit<BourseIntake, "id">[];
};
export type UpdateBourseDTO = Partial<CreateBourseDTO>;

// ─── Pays (Countries) ─────────────────────────────────────────────────
export type Pays = {
  id: number;
  name: string;
  code_iso2?: string;
  flag_emoji?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreatePaysDTO = Omit<Pays, "id" | "created_at" | "updated_at">;
export type UpdatePaysDTO = Partial<CreatePaysDTO>;

// ─── Partenaires (Partners) ───────────────────────────────────────────
export type Partenaire = {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreatePartenairesDTO = Omit<Partenaire, "id" | "created_at" | "updated_at">;
export type UpdatePartenairesDTO = Partial<CreatePartenairesDTO>;

// ─── Publications (Posts) ─────────────────────────────────────────────
export type Publication = {
  id: number;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  video_url?: string;
  author_id?: number;
  author?: AdminUser;
  status?: "brouillon" | "publie" | "archive";
  views_count?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreatePublicationDTO = Omit<Publication, "id" | "created_at" | "updated_at" | "slug">;
export type UpdatePublicationDTO = Partial<CreatePublicationDTO>;

// ─── Utilisateurs (Users) ────────────────────────────────────────────
export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: "admin" | "redacteur" | "user";
  country_id?: number;
  country?: Pays;
  status?: "active" | "inactive" | "banned";
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateUserDTO = Omit<User, "id" | "created_at" | "updated_at" | "email_verified_at">;
export type UpdateUserDTO = Partial<CreateUserDTO>;

// ─── Services ─────────────────────────────────────────────────────────
export type Service = {
  id: number;
  title: string;
  kind?: "coaching" | "formation" | "dossier";
  description?: string;
  price?: number;
  image?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreateServiceDTO = Omit<Service, "id" | "created_at" | "updated_at">;
export type UpdateServiceDTO = Partial<CreateServiceDTO>;

// ─── Stats ────────────────────────────────────────────────────────────
export type StatsOverview = {
  total_users: number;
  total_bourses: number;
  total_applications?: number;
  total_partners?: number;
  active_countries?: number;
  new_users_this_month?: number;
};

// ─── Filtres et requêtes ──────────────────────────────────────────────
export type QueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  order?: "asc" | "desc";
  status?: string;
  [key: string]: any;
};

// ─── Erreurs API ──────────────────────────────────────────────────────
export type ApiErrorDetail = {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  status?: number;
};

export type ValidationError = {
  field: string;
  message: string;
};
