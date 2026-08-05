/**
 * Types spécifiques à l'admin
 */

export type Project = {
  id: number | string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project_type?: { id: number; name: string };
  coordinator?: { id: number; first_name: string; last_name: string };
  start_date?: string;
  end_date?: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProjectStatus = {
  id: number;
  name: string;
  color: string;
  order: number;
};

export type ProjectStatusPayload = Omit<ProjectStatus, "id">;
