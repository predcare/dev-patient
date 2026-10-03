import { useMutation, useQuery } from '@tanstack/react-query';
import { EMRQuerykeys } from '../query.keys';
import { deleteEmr, getCatWiseEmrs, getEmrCategories, uploadEmr } from './emr.funcs';

export const useGetEMRCats = () => {
  return useQuery({
    queryKey: [EMRQuerykeys.EMR_CATS],
    queryFn: () => getEmrCategories(),
    select: v => v.data,
  });
};

export const useGetCatWiseEmrs = (params: {
  document_type: string;
  patient_id: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [EMRQuerykeys.CAT_WISE_EMRS, params],
    queryFn: () => getCatWiseEmrs(params),
    enabled: !!params?.patient_id && !!params?.document_type,
    select: v => v.data,
  });
};

export const useUploadEMR = () => {
  return useMutation({
    mutationKey: [EMRQuerykeys.UPLOAD_EMR],
    mutationFn: uploadEmr,
  });
};

export const useDeleteEMR = () => {
  return useMutation({
    mutationKey: [EMRQuerykeys.DELETE_EMR],
    mutationFn: deleteEmr,
  });
};
