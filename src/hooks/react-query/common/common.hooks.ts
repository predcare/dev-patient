import { useQuery } from '@tanstack/react-query';
import { CommonQueryKeys } from '../query.keys';
import {
  getCities,
  getCommisionSlabs,
  getCountries,
  getSpecializations,
  getStates,
} from './common.func';

export const useCountries = () =>
  useQuery({
    queryKey: [CommonQueryKeys.Countries],
    queryFn: () => getCountries(),
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });

export const useStatesByCId = (params?: { cId?: number }) =>
  useQuery({
    queryKey: [CommonQueryKeys.States, params],
    queryFn: () => getStates(params?.cId!),
    enabled: !!params?.cId,
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });

export const useCitiesBySId = (params?: { sId?: number }) =>
  useQuery({
    queryKey: [CommonQueryKeys.Cities, params],
    queryFn: () => getCities(params?.sId!),
    enabled: !!params?.sId,
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });

export const useSpecializations = () =>
  useQuery({
    queryKey: [CommonQueryKeys.Specializations],
    queryFn: () => getSpecializations(),
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });

export const useCommisionSlabs = () =>
  useQuery({
    queryKey: [CommonQueryKeys.GET_COMMISION_SLABS],
    queryFn: () => getCommisionSlabs(),
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });
