import { useMutation, useQuery } from '@tanstack/react-query';
import { IPolicyAcceptancePayload } from '../../../typescripts/interfaces/policies.interfaces';
import { CommonQueryKeys } from '../query.keys';
import { getPolicies, postPolicyAcceptance } from './policies.funcs';

export const usePolicies = () =>
  useQuery({
    queryKey: [CommonQueryKeys.POLICIES],
    queryFn: () => getPolicies({ role: 'patient' }),
  });

export const usePostPolicyAcceptance = () => {
  return useMutation({
    mutationFn: (payload: IPolicyAcceptancePayload) => postPolicyAcceptance(payload),
  });
};
