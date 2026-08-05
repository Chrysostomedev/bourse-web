import { apiClient } from "@/core/api-client";

export type Comment = {
  id: number;
  content: string;
  post_id: number;
  post_title: string;
  user_id: number;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
};

export type CommentStats = {
  total: number;
  today: number;
  pending_moderation: number;
};

export const commentsAdminService = {
  /**
   * Récupère tous les commentaires (avec pagination)
   */
  async getAll(page = 1, limit = 20): Promise<{
    data: Comment[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }> {
    const res = await apiClient.get(`/admin/comments?page=${page}&limit=${limit}`);
    return res.data ?? res;
  },

  /**
   * Récupère les commentaires d'un post spécifique
   */
  async getByPostId(postId: number, page = 1): Promise<{
    data: Comment[];
    post_title: string;
  }> {
    const res = await apiClient.get(`/admin/posts/${postId}/comments?page=${page}`);
    return res.data ?? res;
  },

  /**
   * Récupère les statistiques des commentaires
   */
  async getStats(): Promise<CommentStats> {
    return apiClient.get(`/admin/comments/stats`);
  },

  /**
   * Supprime un commentaire
   */
  async delete(commentId: number): Promise<{ message: string }> {
    return apiClient.delete(`/admin/comments/${commentId}`);
  },

  /**
   * Récupère les commentaires par état (signalés, approuvés, rejetés)
   */
  async getByStatus(
    status: "pending" | "approved" | "rejected",
    page = 1
  ): Promise<{ data: Comment[] }> {
    const res = await apiClient.get(
      `/admin/comments?status=${status}&page=${page}`
    );
    return res.data ?? res;
  },

  /**
   * Approuve un commentaire
   */
  async approve(commentId: number): Promise<{ message: string }> {
    return apiClient.post(`/admin/comments/${commentId}/approve`, {});
  },

  /**
   * Rejette un commentaire
   */
  async reject(commentId: number): Promise<{ message: string }> {
    return apiClient.post(`/admin/comments/${commentId}/reject`, {});
  },
};
