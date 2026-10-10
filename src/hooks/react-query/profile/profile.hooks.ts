import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import { IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import { IMyProfileDoc } from '../../../typescripts/interfaces/profile.interfaces';
import { ProfileQueryKeys } from '../query.keys';
import {
  addFamilyMember,
  deleteFamilyMember,
  editFamilyMember,
  getFamilyMemberInfo,
  getFamilyMembers,
  getProfile,
  switchAccount,
  updateProfile,
} from './profile.funcs';

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

export const seedProfileFromAuth = (res?: { data?: unknown; user?: unknown } | null) => {
  const candidate = (res?.data ?? res?.user) as IMyProfileDoc | undefined;
  if (!candidate || typeof candidate !== 'object' || !candidate.id) {
    return null;
  }
  queryClient.setQueryData([ProfileQueryKeys.Profile], {
    success: true,
    message: '',
    data: candidate,
  } as IRootResponse<IMyProfileDoc>);
  return candidate;
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

// Add Family Member
export const useAddFamilyMember = () => {
  return useMutation({
    mutationFn: addFamilyMember,
  });
};

// Get Family Members
export const useGetFamilyMembers = () =>
  useQuery({
    queryKey: [ProfileQueryKeys?.FAMILY_MEMBER_LIST],
    queryFn: getFamilyMembers,
    select: v => v.data,
  });

// Delete Family Member
export const useRevokeFamilyMember = () => {
  return useMutation({
    mutationFn: deleteFamilyMember,
  });
};
// Get Family Member Info
export const useGetFamilyMemberInfo = (id: number) => {
  return useQuery({
    queryKey: [ProfileQueryKeys.FAMILY_MEMBER_INFO, id],
    enabled: !!id,
    queryFn: () => getFamilyMemberInfo(id),
    select: v => v.data,
  });
};

// Delete Family Member
export const useEditFamilyMember = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: {
        name: string;
        gender: string;
        relation: string;
        date_of_birth: string;
      };
    }) => editFamilyMember(id, body),
  });
};

// Switch Account
export const useSwitchAccount = () => {
  return useMutation({
    mutationFn: switchAccount,
  });
};
