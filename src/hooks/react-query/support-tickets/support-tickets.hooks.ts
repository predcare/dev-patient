import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import {
  IGetMyTicketsParams,
  IGetSupportCategoriesParams,
} from '../../../typescripts/interfaces/support-tickets.interfaces';
import { SupportTicketQueryKeys } from '../query.keys';
import {
  createSupportTicket,
  deleteSupportTicket,
  getMySupportTickets,
  getSupportCategories,
  getSupportTicketDetails,
} from './support-tickets.funcs';

export const useGetMySupportTickets = (params?: IGetMyTicketsParams) => {
  return useQuery({
    queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS, params],
    queryFn: () => getMySupportTickets(params),
  });
};

export const useGetMySupportTicketsInfinite = (params?: Omit<IGetMyTicketsParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getMySupportTickets({
        ...params,
        page: pageParam as number,
        limit: params?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = (lastPage as any)?.meta?.pagination || (lastPage as any)?.meta;
      if (!meta) return undefined;
      const currentPage = Number(meta.page || 1);
      const totalPages = Number(meta.totalPages || meta.total_pages || 1);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const useGetSupportCategories = (params?: IGetSupportCategoriesParams) => {
  return useQuery({
    queryKey: [SupportTicketQueryKeys.GET_CATEGORIES, params],
    queryFn: () => getSupportCategories(params),
    select: res => res.data,
  });
};

export const useGetSupportTicketDetails = (
  id?: string | number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [SupportTicketQueryKeys.GET_TICKET_DETAILS, id],
    queryFn: () => getSupportTicketDetails(id!),
    enabled: options?.enabled !== undefined ? options.enabled && !!id : !!id,
    select: res => res.data,
  });
};

export const useCreateSupportTicket = () => {
  return useMutation({
    mutationKey: [SupportTicketQueryKeys.CREATE_TICKET],
    mutationFn: (body: FormData) => createSupportTicket(body),
  });
};

export const useDeleteSupportTicket = () => {
  return useMutation({
    mutationKey: [SupportTicketQueryKeys.DELETE_TICKET],
    mutationFn: (id: string | number) => deleteSupportTicket(id),
  });
};
