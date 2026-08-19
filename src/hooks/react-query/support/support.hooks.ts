import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ICreateSupportTicketPayload,
  IGetSupportTicketsParams,
} from '../../../typescripts/interfaces/support.interfaces';
import { SupportQueryEnum } from '../query.keys';
import { createSupportTicket, getSupportTicketDetails, getSupportTickets } from './support.funcs';

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SupportQueryEnum.CREATE_SUPPORT_TICKET],
    mutationFn: (payload: FormData | ICreateSupportTicketPayload) => createSupportTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SupportQueryEnum.GET_SUPPORT_TICKETS],
      });
    },
  });
};

export const useSupportTickets = (
  params?: IGetSupportTicketsParams,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: [SupportQueryEnum.GET_SUPPORT_TICKETS, params],
    queryFn: () => getSupportTickets(params),
    enabled: options?.enabled ?? true,
  });

export const useSupportTicketDetails = (id: string | number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [SupportQueryEnum.GET_SUPPORT_TICKET_DETAILS, id],
    queryFn: () => getSupportTicketDetails(id),
    enabled: !!id && (options?.enabled ?? true),
  });
