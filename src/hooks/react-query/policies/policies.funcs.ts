import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { ICommonRoot } from '../../../typescripts/interfaces/common.interfaces';
import {
  IGetPoliciesRoot,
  IPolicyAcceptancePayload,
} from '../../../typescripts/interfaces/policies.interfaces';

export const getPolicies = async (params: { role: string }) => {
  const res = await axiosInstance.get<IGetPoliciesRoot>(
    `${endpoints.commons.policies}?role=${params?.role}`
  );
  return res.data?.data;
};

export const postPolicyAcceptance = async (payload: IPolicyAcceptancePayload) => {
  const res = await axiosInstance.post<ICommonRoot>(`${endpoints.commons.policyAccept}`, payload);
  return res.data;
};
