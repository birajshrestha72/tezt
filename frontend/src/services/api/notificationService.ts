import api from './axios';

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

export interface NotificationRecord {
  id: number;
  message: string;
  notificationType: string;
  referenceKey?: string | null;
  payloadJson?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationPayload {
  message: string;
  notificationType?: string;
  referenceKey?: string | null;
  payloadJson?: string | null;
}

export const notificationService = {
  async getNotifications(notificationType?: string) {
    const response = await api.get<ApiResponse<NotificationRecord[]>>('/notifications', {
      params: notificationType ? { notificationType } : undefined,
    });
    return unwrap(response);
  },

  async getUnreadNotifications(notificationType?: string) {
    const response = await api.get<ApiResponse<NotificationRecord[]>>('/notifications/unread', {
      params: notificationType ? { notificationType } : undefined,
    });
    return unwrap(response);
  },

  async getUnreadCount(notificationType?: string) {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count', {
      params: notificationType ? { notificationType } : undefined,
    });
    return unwrap(response);
  },

  async createNotification(payload: CreateNotificationPayload) {
    const response = await api.post<ApiResponse<NotificationRecord>>('/notifications', payload);
    return unwrap(response);
  },

  async markAsRead(id: number) {
    const response = await api.patch<ApiResponse<NotificationRecord>>(`/notifications/${id}/read`);
    return unwrap(response);
  },

  async markAllAsRead() {
    const response = await api.patch<ApiResponse<{ updated: number }>>('/notifications/read-all');
    return unwrap(response);
  },

  async deleteNotification(id: number) {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(`/notifications/${id}`);
    return unwrap(response);
  },
};
