import { Platform } from 'react-native';
import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import {
  ICreateSupportTicketPayload,
  IGetSupportTicketsParams,
  ISupportTicket,
  ISupportTicketListApiResponse,
  ISupportTicketSingleApiResponse,
} from '../../../typescripts/interfaces/support.interfaces';

export const createSupportTicket = async (payload: FormData | ICreateSupportTicketPayload) => {
  let body: FormData;

  if (payload instanceof FormData) {
    body = payload;
  } else {
    body = new FormData();
    body.append('subject', payload.subject);
    body.append('message', payload.message);

    if (payload.attachments && Array.isArray(payload.attachments)) {
      payload.attachments.forEach((file: any, index: number) => {
        if (typeof file === 'object' && file.uri) {
          const fileUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
          const fileName = file.fileName || file.name || `attachment_${index}_${Date.now()}.jpg`;
          const mimeType = file.type || file.mimeType || 'image/jpeg';

          body.append('attachments', {
            uri: fileUri,
            name: fileName,
            type: mimeType,
          } as any);
        }
      });
    }
  }

  const res = await axiosInstance.post<IRootResponse<ISupportTicket>>(
    endpoints.supports.create,
    body,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
};

export const getSupportTickets = async (params?: IGetSupportTicketsParams) => {
  const res = await axiosInstance.get<ISupportTicketListApiResponse>(endpoints.supports.getAll, {
    params,
  });
  return res.data;
};

export const getSupportTicketDetails = async (id: string | number) => {
  const res = await axiosInstance.get<ISupportTicketSingleApiResponse>(
    endpoints.supports.getSingle(id)
  );
  return res.data;
};
