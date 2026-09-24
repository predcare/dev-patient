import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
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
