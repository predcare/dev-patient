import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import { IMyProfileDoc } from '../../../typescripts/interfaces/profile.interfaces';

export const getProfile = async () => {
  const res = await axiosInstance.get<IRootResponse<IMyProfileDoc>>(`${endpoints.profile.get}`);
  return res.data;
};

export const updateProfile = async (formData: FormData) => {
  const res = await axiosInstance.put<IRootResponse<any>>(endpoints.profile.update, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
