import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { ICommonRoot } from '../../../typescripts/interfaces/common.interfaces';
import {
  IGetMyTicketsParams,
  IGetSupportCategoriesParams,
  TSupportCategoriesRoot,
  TSupportTicketDeleteResponse,
  TSupportTicketDetailsResponse,
  TSupportTicketsListRoot,
} from '../../../typescripts/interfaces/support-tickets.interfaces';

export const createSupportTicket = async (body: FormData) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.supportTickets.create, body);
  return res.data;
};

export const getMySupportTickets = async (params?: IGetMyTicketsParams) => {
  const res = await axiosInstance.get<TSupportTicketsListRoot>(endpoints.supportTickets.myTickets, {
    params,
  });
  return res.data;
};

export const getSupportCategories = async (params?: IGetSupportCategoriesParams) => {
  const res = await axiosInstance.get<TSupportCategoriesRoot>(endpoints.supportTickets.categories, {
    params,
  });
  return res.data;
};

export const getSupportTicketDetails = async (id: string | number) => {
  const res = await axiosInstance.get<TSupportTicketDetailsResponse>(
    endpoints.supportTickets.details(id)
  );
  return res.data;
};

export const deleteSupportTicket = async (id: string | number) => {
  const res = await axiosInstance.delete<TSupportTicketDeleteResponse>(
    endpoints.supportTickets.delete(id)
  );
  return res.data;
};
