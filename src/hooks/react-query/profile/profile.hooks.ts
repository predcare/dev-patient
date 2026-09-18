import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import { ProfileQueryKeys } from '../query.keys';
import { getProfile, updateProfile } from './profile.funcs';

export const useProfile = () =>
  useQuery({
    queryKey: [ProfileQueryKeys.Profile],
    queryFn: () => getProfile(),
    select: v => v.data,
  });

export const fetchProfileQuery = async (forceFetch = false) => {
  return await queryClient.fetchQuery({
    queryKey: [ProfileQueryKeys.Profile],
    queryFn: getProfile,
    staleTime: forceFetch ? 0 : undefined,
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ProfileQueryKeys.Profile] });
    },
  });
};
