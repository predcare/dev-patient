import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { _projectToken } from '../config/keys.constants';
import { globalError, globalSuccess, globalWarning } from '../lib/functions/_helpers.lib';
import eventEmitter from '../lib/services/event.emitter';
import events from '../lib/services/events/events';
import { NetworkRoot } from '../typescripts/enums';
import { IBaseApiRoot } from '../typescripts/interfaces/axios.interfaces';
import { baseUrlApi, exclude401Routes, successEndpoints } from './endpoints';
let isAlreadyHandlingUnauthorized = false;
let isAlreadyHandlingNetworkError = false;

const axiosInstance = axios.create({
  baseURL: baseUrlApi,
});

axiosInstance.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(_projectToken);
  console.log('dev token ==================>', token)
  if (token && !!config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res: AxiosResponse<IBaseApiRoot>) => {
    console.log('res.config.url', res.config.url);
    if (successEndpoints.includes(res.config.url as string)) {
      const method = res.config.method?.toLowerCase();
      const successMethods = ['post', 'put', 'patch', 'delete'];
      const url = res.config.url as string;
      const shouldShowSuccess =
        successEndpoints.includes(url) && successMethods.includes(method || '');
      if (shouldShowSuccess) {
        const validStatus = [200, 201];
        if (validStatus.includes(res?.data?.status)) {
          globalSuccess(res);
        } else {
          globalWarning(res);
        }
      }
    }

    return res;
  },
  async (error: AxiosError<IBaseApiRoot>) => {
    const status = error.response?.status;
    const networkStatus = error?.code === NetworkRoot.ERR_NETWORK;
    const invalidTokenStatuses = [401];
    const requestUrl = error.config?.url || '';
    const isExcludedRoute = exclude401Routes.some(route => requestUrl.includes(route));

    if (status && invalidTokenStatuses.includes(status) && !isExcludedRoute) {
      if (!isAlreadyHandlingUnauthorized) {
        isAlreadyHandlingUnauthorized = true;
        eventEmitter.emit(events.logoutCurrentUser);
        setTimeout(() => {
          isAlreadyHandlingUnauthorized = false;
        }, 2000);
      }
      return Promise.reject(error);
    }
    if (networkStatus) {
      if (!isAlreadyHandlingNetworkError) {
        isAlreadyHandlingNetworkError = true;
        globalError(error);
        setTimeout(() => {
          isAlreadyHandlingNetworkError = false;
        }, 2000);
      }
      return Promise.reject(error);
    }
    globalError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
