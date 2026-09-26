import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { InvoiceQueryKey } from '../query.keys';
import { getInvoiceInfo, getInvoicePdf, getMyInvoices } from './invoices.funcs';
import { IInvoiceListQuery } from './payload.interfaces';

export const useGetAllInvoices = (params?: IInvoiceListQuery) => {
  return useQuery({
    queryKey: [InvoiceQueryKey.MyInvoices, params],
    queryFn: () => getMyInvoices(params),
  });
};

export const useGetAllInvoicesInfinite = (params?: Omit<IInvoiceListQuery, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [InvoiceQueryKey.MyInvoices, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getMyInvoices({
        ...params,
        page: pageParam as number,
        limit: params?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      const currentPage = meta.page || 1;
      const totalPages = meta.totalPages || (meta as any)?.total_pages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const useGetAllInvoiceInfo = (id: number) => {
  return useQuery({
    queryKey: [InvoiceQueryKey.MyInvoicesInfo, id],
    enabled: !!id,
    queryFn: () => getInvoiceInfo(id),
    select: v => v.data,
  });
};

export const useDownloadInvoicePdf = () =>
  useMutation({
    mutationFn: (invoiceId: number) => getInvoicePdf(invoiceId),
  });
