import RNFS from 'react-native-fs';
import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { arrayBufferToBase64 } from '../../../lib/common/file.utils';
import { TRxInfoRoot, TRxListRoot } from '../../../typescripts/interfaces/prescriptions.interfaces';

export type RxStatus = 'draft' | 'completed' | 'sent';
export type RxDateFilter = 'today' | 'this_week' | 'current_month' | 'current_year' | 'custom';

export interface IRxParamQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: RxStatus | string;
  date_filter?: RxDateFilter | string;
  from_date?: string;
  to_date?: string;
}
export const getMyPrescriptions = async (params: IRxParamQuery) => {
  const res = await axiosInstance.get<TRxListRoot>(`${endpoints.prescriptions.getAll}`, {
    params,
  });
  return res.data;
};

export const getMyPrescriptionInfo = async (id: number) => {
  const res = await axiosInstance.get<TRxInfoRoot>(`${endpoints.prescriptions.getInfo(id)}`);
  return res.data;
};

export const downloadPrescriptionPdf = async ({
  id,
  onProgress,
}: {
  id: string | number;
  onProgress?: (progressPercentage: number) => void;
}): Promise<string> => {
  const filename = `Prescription_RX${String(id).padStart(6, '0')}.pdf`;
  const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

  const response = await axiosInstance.get(endpoints.prescriptions.downloadPrescription(id), {
    responseType: 'arraybuffer',
    onDownloadProgress: e => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  const base64 = arrayBufferToBase64(response.data as ArrayBuffer);
  if (await RNFS.exists(destPath)) {
    await RNFS.unlink(destPath);
  }
  await RNFS.writeFile(destPath, base64, 'base64');
  return destPath;
};
