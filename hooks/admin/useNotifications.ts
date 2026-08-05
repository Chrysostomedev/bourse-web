"use client";

import { useState } from "react";

export type NotifSource = "system" | "post" | "scholarship" | "comment";

export interface Notification {
  id: string;
  title: string;
  message: string;
  source: NotifSource;
  read: boolean;
  timestamp: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    markAsRead,
    deleteNotification,
    setNotifications,
  };
}
