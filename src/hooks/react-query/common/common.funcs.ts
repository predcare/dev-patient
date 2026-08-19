import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import {
  GetCitiesParams,
  GetCountriesParams,
  GetStatesParams,
  ICity,
  ICountry,
  IRootResponse,
  IState,
} from '../../../typescripts/interfaces/common.interfaces';

export const getCountries = async (params?: GetCountriesParams) => {
  const res = await axiosInstance.get<IRootResponse<ICountry[]>>(endpoints.common.countries, {
    params,
  });
  return res.data;
};

export const getStates = async (params?: GetStatesParams) => {
  const res = await axiosInstance.get<IRootResponse<IState[]>>(endpoints.common.states, {
    params,
  });
  return res.data;
};

export const getCities = async (params?: GetCitiesParams) => {
  const res = await axiosInstance.get<IRootResponse<ICity[]>>(endpoints.common.cities, {
    params,
  });
  return res.data;
};

export { useGetCities, useGetCountries, useGetStates } from './common.hooks';

