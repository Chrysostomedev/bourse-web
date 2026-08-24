import { get, post, del } from "@/core/axios";

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
    return get(`/admin/comments?page=${page}&limit=${limit}`);
  },

  /**
   * Récupère les commentaires d'un post spécifique
   */
  async getByPostId(postId: number, page = 1): Promise<{
    data: Comment[];
    post_title: string;
  }> {
    return get(`/admin/posts/${postId}/comments?page=${page}`);
  },

  /**
   * Récupère les statistiques des commentaires
   */
  async getStats(): Promise<CommentStats> {
    return get(`/admin/comments/stats`);
  },

  /**
   * Supprime un commentaire
   */
  async delete(commentId: number): Promise<{ message: string }> {
    return del(`/admin/comments/${commentId}`);
  },

  /**
   * Récupère les commentaires par état (signalés, approuvés, rejetés)
   */
  async getByStatus(
    status: "pending" | "approved" | "rejected",
    page = 1
  ): Promise<{ data: Comment[] }> {
    return get(`/admin/comments?status=${status}&page=${page}`);
  },

  /**
   * Approuve un commentaire
   */
  async approve(commentId: number): Promise<{ message: string }> {
    return post(`/admin/comments/${commentId}/approve`, {});
  },

  /**
   * Rejette un commentaire
   */
  async reject(commentId: number): Promise<{ message: string }> {
    return post(`/admin/comments/${commentId}/reject`, {});
  },
};
