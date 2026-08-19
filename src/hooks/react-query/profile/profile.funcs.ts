import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { TMyProfileRoot } from '../../../typescripts/interfaces/myProfile.interfaces';

export const getUserProfile = async () => {
  const res = await axiosInstance.get<TMyProfileRoot>(endpoints.profile.get);
  return res.data;
};

export const updateUserProfile = async (body: FormData) => {
  const res = await axiosInstance.put<TMyProfileRoot>(endpoints.profile.update, body, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
