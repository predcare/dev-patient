import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { NotificationQueryKeys } from '../query.keys';
import { getNotificationCount, getNotifications } from './notifications.funcs';

export const useNotificationCount = () => {
  return useQuery({
    queryKey: [NotificationQueryKeys.NotificationCount],
    queryFn: () => getNotificationCount(),
  });
};

export const useNotifications = (params?: { page: number; limit: number }) =>
  useQuery({
    queryKey: [NotificationQueryKeys.Notifications, params],
    queryFn: () => getNotifications(params),
  });

export const useInfiniteNotifications = (limit = 10) =>
  useInfiniteQuery({
    queryKey: [NotificationQueryKeys.Notifications, 'infinite', limit],
    queryFn: ({ pageParam = 1 }) => getNotifications({ page: pageParam as number, limit }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = lastPage?.meta;
      const currentPage = Number(meta?.page || 1);
      const totalPages = Number(meta?.total_pages || meta?.totalPages || 1);
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
  });
