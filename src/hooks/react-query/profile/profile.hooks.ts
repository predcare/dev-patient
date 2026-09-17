import { useQuery } from '@tanstack/react-query';
import { ProfileQueryKeys } from '../query.keys';
import { getProfile } from './profile.funcs';

export const useProfile = () =>
  useQuery({
    queryKey: [ProfileQueryKeys.Profile],
    queryFn: () => getProfile(),
    select: v => v.data,
  });
