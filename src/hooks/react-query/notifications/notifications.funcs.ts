import axiosInstance from '../../../services/api/apiClient';
import { endpoints } from '../../../services/api/endpoints';
import { ICommonRoot, IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import { INotificationDoc } from '../../../typescripts/interfaces/notification.interfaces';

export const getNotificationCount = async () => {
  const res = await axiosInstance.get<IRootResponse<{ unread_count: number }>>(
    endpoints.notifications.counts
  );
  return res.data;
};

export const getNotifications = async (params?: { page: number; limit: number }) => {
  const res = await axiosInstance.get<IRootResponse<INotificationDoc[]>>(
    `${endpoints.notifications.getAll}`,
    {
      params,
    }
  );
  return res.data;
};

export const deleteNotification = async (notificationId: number | string) => {
  const res = await axiosInstance.delete<ICommonRoot>(
    `${endpoints.notifications.delete}${notificationId}`
  );
  return res.data;
};

export const markNoShowNotifications = async () => {
  const res = await axiosInstance.delete<ICommonRoot>(endpoints.notifications.clearNotify);
  return res.data;
};
