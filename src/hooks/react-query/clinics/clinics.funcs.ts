import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { IClinicDetailsRoot, IClinicDoctorsRoot } from '../../../typescripts/interfaces/clinics.interfaces';

export const getClinicInfo = async (clinicId: number) => {
  const res = await axiosInstance.get<IClinicDetailsRoot>(`${endpoints.clinics.getInfo(clinicId)}`);
  return res.data;
};

export const getClinicDoctors = async (clinicId: number) => {
  const res = await axiosInstance.get<IClinicDoctorsRoot>(`${endpoints.clinics.getDoctors(clinicId)}`);
  return res.data;
};
