import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { PrescriptionQueryKeys } from '../query.keys';
import {
  downloadPrescriptionPdf,
  getMyPrescriptionInfo,
  getMyPrescriptions,
  IRxParamQuery,
} from './prescriptions.funcs';

export const useGetPrescriptions = (params: IRxParamQuery) =>
  useQuery({
    queryKey: [PrescriptionQueryKeys.GET_ALL, params],
    queryFn: () => getMyPrescriptions(params),
  });

export const useGetPrescriptionsInfinite = (params?: Omit<IRxParamQuery, 'page'>) =>
  useInfiniteQuery({
    queryKey: [PrescriptionQueryKeys.GET_ALL, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getMyPrescriptions({
        ...params,
        page: pageParam as number,
        limit: params?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      const currentPage = meta.page || 1;
      const totalPages = meta.totalPages || meta.total_pages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

export const useGetPrescriptionInfo = (params: { id: number }) =>
  useQuery({
    queryKey: [PrescriptionQueryKeys.GET_INFO, params],
    queryFn: () => getMyPrescriptionInfo(params?.id),
    enabled: !!params?.id,
    select: v => v.data,
  });

export const useDownloadPrescriptionPdf = () => {
  return useMutation({
    mutationKey: [PrescriptionQueryKeys.Pdf],
    mutationFn: ({
      id,
      onProgress,
    }: {
      id: string | number;
      onProgress?: (progress: number) => void;
    }) => downloadPrescriptionPdf({ id, onProgress }),
  });
};
