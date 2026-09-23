export interface ICommonRoot {
  success: number;
  message: string;
  data?: unknown;
  status: number;
  id?: number;
  token?: string;
}

export interface IRootResponse<T> {
  success: number | boolean;
  message: string;
  data: T;
  user?: T;
  token?: string;
  status?: number;
  meta: IPaginateMeta;
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

export interface IPaginateMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total_pages: number;
  limit: number;
}

export interface ICommisionSlabsDoc {
  id: string;
  doctor_id: any;
  min_amount: string;
  max_amount?: string;
  fee_type: string;
  fee_value: string;
  status: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ICommonEMRCats {
  id: string;
  name: string;
  icon: any;
  is_active: boolean;
  sort_order: number;
}
