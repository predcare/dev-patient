import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { TStatsRoot } from '../../../typescripts/interfaces/stats.interfaces';

export const getUserStats = async () => {
  const response = await axiosInstance.get<TStatsRoot>(endpoints.stats.get);
  return response?.data;
};
