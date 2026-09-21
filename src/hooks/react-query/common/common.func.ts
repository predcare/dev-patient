import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import {
  ICommisionSlabsDoc,
  IRootResponse,
} from '../../../typescripts/interfaces/common.interfaces';
import { ILocationDoc } from '../../../typescripts/interfaces/locations.interfaces';

export const getCountries = async () => {
  const res = await axiosInstance.get<IRootResponse<ILocationDoc[]>>(
    `${endpoints.commons.country}`
  );
  return res.data;
};

export const getStates = async (countryId: number) => {
  const res = await axiosInstance.get<IRootResponse<ILocationDoc[]>>(
    `${endpoints.commons.states(countryId)}`
  );
  return res.data;
};

export const getCities = async (stateId: number) => {
  const res = await axiosInstance.get<IRootResponse<ILocationDoc[]>>(
    `${endpoints.commons.cities(stateId)}`
  );
  return res.data;
};

export const getSpecializations = async () => {
  const res = await axiosInstance.get<IRootResponse<any[]>>(`${endpoints.commons.specializations}`);
  return res.data;
};

export const getCommisionSlabs = async () => {
  const res = await axiosInstance.get<IRootResponse<ICommisionSlabsDoc[]>>(
    `${endpoints.commons.getCommisionSlabs}`
  );
  return res.data;
};
