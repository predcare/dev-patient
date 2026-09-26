import { useQuery } from '@tanstack/react-query';
import { StatsQueryKey } from '../query.keys';
import { getUserStats } from './stats.funcs';

// Get
export const useGetStats = () => {
  return useQuery({
    queryKey: [StatsQueryKey.Stats],
    queryFn: getUserStats,
    select: v => v.data,
  });
};
