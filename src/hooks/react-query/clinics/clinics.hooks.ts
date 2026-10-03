import { useQuery } from '@tanstack/react-query';
import { ClinicQueryKeys } from '../query.keys';
import { getClinicDoctors, getClinicInfo } from './clinics.funcs';

export const useClinicInfo = ({ clinicId }: { clinicId: number }) => {
  return useQuery({
    queryKey: [ClinicQueryKeys.CLINIC_INFO, clinicId],
    queryFn: () => getClinicInfo(clinicId),
    enabled: !!clinicId,
    select: data => data.data,
  });
};

export const useClinicDoctors = ({ clinicId }: { clinicId: number }) => {
  return useQuery({
    queryKey: [ClinicQueryKeys.CLINIC_DOCTORS, clinicId],
    queryFn: () => getClinicDoctors(clinicId),
    enabled: !!clinicId,
    select: data => data.data,
  });
};
