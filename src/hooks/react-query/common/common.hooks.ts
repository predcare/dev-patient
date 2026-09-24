import { useQuery } from '@tanstack/react-query';
import { CommonQueryKeys } from '../query.keys';
import {
  getAllCities,
  getCities,
  getCmnEmrCategories,
  getCommisionSlabs,
  getCountries,
  getHealthCareTips,
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

export const useCmnEmrCategories = () =>
  useQuery({
    queryKey: [CommonQueryKeys.GET_EMR_CATEGORIES],
    queryFn: () => getCmnEmrCategories(),
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });

export const useGetHealthCareTips = () =>
  useQuery({
    queryKey: [CommonQueryKeys.GET_HEALTH_CARE_TIPS],
    queryFn: () => getHealthCareTips(),
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });

export const useAllCities = (params?: { search?: string }) =>
  useQuery({
    queryKey: [CommonQueryKeys.Cities, params],
    queryFn: () => getAllCities(params),
    enabled: !!params?.search,
    select: (v: any) => {
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.data)) return v.data;
      return [];
    },
  });
