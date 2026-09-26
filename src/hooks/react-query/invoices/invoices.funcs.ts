import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import {
  TGetInvoiceDetailsRoot,
  TInvoiceListRoot,
} from '../../../typescripts/interfaces/invoices.interfaces';
import { IInvoiceListQuery } from './payload.interfaces';

// Get All
export const getMyInvoices = async (params?: IInvoiceListQuery) => {
  const res = await axiosInstance.get<TInvoiceListRoot>(endpoints.invoices.getAll, { params });
  return res.data;
};

// Get Info
export const getInvoiceInfo = async (id: number) => {
  const res = await axiosInstance.get<TGetInvoiceDetailsRoot>(endpoints.invoices.getInfo(id));
  return res.data;
};

export const getInvoicePdf = async (invoiceId: number | string): Promise<ArrayBuffer> => {
  const res = await axiosInstance.get(endpoints.invoices.downloadPdf(invoiceId), {
    responseType: 'arraybuffer',
  });

  return res.data as ArrayBuffer;
};
