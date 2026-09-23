import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { ICommonRoot } from '../../../typescripts/interfaces/common.interfaces';
import { TEMRCatsRoot, TEmrListRoot } from '../../../typescripts/interfaces/emr.interfaces';

export const getEmrCategories = async () => {
  const res = await axiosInstance.get<TEMRCatsRoot>(`${endpoints.emr.emrCat}`);
  return res.data;
};

export const getCatWiseEmrs = async (params: {
  document_type: string;
  patient_id: number;
  search?: string;
}) => {
  const res = await axiosInstance.get<TEmrListRoot>(`${endpoints.emr.catWiseEmrs}`, {
    params,
  });
  return res.data;
};

export const uploadEmr = async (body: FormData) => {
  const res = await axiosInstance.post<ICommonRoot>(`${endpoints.emr.uploadEMr}`, body);
  return res.data;
};

export const deleteEmr = async (id: number) => {
  const res = await axiosInstance.delete<ICommonRoot>(`${endpoints.emr.delete(id)}`);
  return res.data;
};
