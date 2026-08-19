export interface ICommonRoot {
  success: number;
  message: string;
  data?: unknown;
  status: number;
}

export interface IRootResponse<T> {
  success: number | boolean;
  message: string;
  data: T;
  token?: string;
  status?: number;
}

export interface IPasswordStrength {
  value: number;
  color: string;
  label: string;
}

export interface IPagination {
  page: string | number;
  limit: string | number;
  total: number;
  totalPages: number;
}

export interface ICountry {
  id: string;
  name: string;
  code: string;
  status: boolean;
}

export interface IState {
  id: string;
  country_id: string;
  name: string;
  status: boolean;
}

export interface ICity {
  id: string;
  state_id: string;
  name: string;
  status: boolean;
}

export interface GetCountriesParams {
  search?: string;
}

export interface GetStatesParams {
  country_id?: number | string;
  search?: string;
}

export interface GetCitiesParams {
  state_id?: number | string;
  country_id?: number | string;
  search?: string;
}

