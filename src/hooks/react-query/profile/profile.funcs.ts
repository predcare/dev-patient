import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { ICommonRoot, IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import {
  IFamilyMemberInfoRoot,
  IFamilyMemberList,
  IMyProfileDoc,
} from '../../../typescripts/interfaces/profile.interfaces';

export const getProfile = async () => {
  const res = await axiosInstance.get<IRootResponse<IMyProfileDoc>>(`${endpoints.profile.get}`);
  return res.data;
};

export const updateProfile = async (formData: FormData) => {
  const res = await axiosInstance.put<ICommonRoot>(endpoints.profile.update, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const addFamilyMember = async (body: {
  name: string;
  gender: string;
  relation: string;
  date_of_birth: string;
}) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.profile.addFamilyMembers, body);
  return res.data;
};

export const getFamilyMembers = async () => {
  const res = await axiosInstance.get<IFamilyMemberList>(endpoints.profile.getFamilyMembers);
  return res.data;
};

export const deleteFamilyMember = async (id: number) => {
  const res = await axiosInstance.delete<ICommonRoot>(endpoints.profile.familyMemberDelete(id));
  return res.data;
};

export const editFamilyMember = async (
  id: number,
  body: {
    name: string;
    gender: string;
    relation: string;
    date_of_birth: string;
  }
) => {
  const res = await axiosInstance.put<ICommonRoot>(endpoints.profile.familyMemberEdit(id), body);
  return res.data;
};

export const getFamilyMemberInfo = async (id: number) => {
  const res = await axiosInstance.get<IFamilyMemberInfoRoot>(
    endpoints.profile.getFamilyMemberInfo(id)
  );
  return res.data;
};
