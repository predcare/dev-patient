import { useMutation, useQuery } from '@tanstack/react-query';
import { UserQueryEnum } from '../query.keys';
import { getUserProfile, updateUserProfile } from './profile.funcs';

export const useProfile = () =>
  useQuery({
    queryKey: [UserQueryEnum.PROFILE],
    queryFn: getUserProfile,
    select: v => v.data,
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationKey: [UserQueryEnum.UPDATE_PROFILE],
    mutationFn: updateUserProfile,
  });
