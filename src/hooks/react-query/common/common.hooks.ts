import { useQuery } from '@tanstack/react-query';
import {
  GetCitiesParams,
  GetCountriesParams,
  GetStatesParams,
} from '../../../typescripts/interfaces/common.interfaces';
import { CommonQueryEnum } from '../query.keys';
import { getCities, getCountries, getStates } from './common.funcs';

export const useGetCountries = (params?: GetCountriesParams) =>
  useQuery({
    queryKey: [CommonQueryEnum.COUNTRIES, params],
    queryFn: () => getCountries(params),
    select: res => res.data,
  });

export const useGetStates = (params?: GetStatesParams) =>
  useQuery({
    queryKey: [CommonQueryEnum.STATES, params],
    queryFn: () => getStates(params),
    select: res => res.data,
    enabled: Boolean(params?.country_id),
  });

export const useGetCities = (params?: GetCitiesParams) =>
  useQuery({
    queryKey: [CommonQueryEnum.CITIES, params],
    queryFn: () => getCities(params),
    select: res => res.data,
    enabled: Boolean(params?.state_id),
  });
