import { AxiosError, AxiosResponse } from 'axios';
import { IBaseApiRoot } from '../../typescripts/interfaces/axios.interfaces';
import eventEmitter from '../services/event.emitter';
import events from '../services/events/events';

export const globalSuccess = (response: AxiosResponse<IBaseApiRoot>) => {
  let message = 'Something went wrong (Internal Server Error 502)';
  if (response?.data?.message) {
    message = response?.data.message;
  }
  eventEmitter.emit(events.showToast, {
    message,
    options: { variant: 'success' },
  });
};

export const globalWarning = (response: AxiosResponse<IBaseApiRoot>) => {
  let message = 'Something went wrong (Internal Server Error 502)';
  if (response?.data?.message) {
    message = response?.data.message;
  }
  eventEmitter.emit(events.showToast, {
    message,
    options: { variant: 'warning' },
  });
};

export const globalError = (error: AxiosError<IBaseApiRoot>) => {
  let message = 'Something Went Wrong';
  if (error?.code === 'ERR_NETWORK') {
    message = 'Internal Server Error';
  } else if (error?.code === 'ECONNABORTED') {
    message = 'The request took too long to respond. Please try again in a moment.';
  } else if (error?.response?.status === 400) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 404) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 409) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 406) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 403) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 429) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 402) {
    message = error.response.data?.message || 'There seems to be an issue with your request.';
  } else if (error?.response?.status === 413) {
    message = error.response.data?.message || 'File is too large. Please try again later.';
  } else if (error?.response?.status === 500) {
    message =
      error.response.data?.message ||
      'We’re experiencing some technical issues. Please try again later.';
  }
  eventEmitter.emit(events.showToast, {
    message,
    options: { variant: 'error' },
  });
};

export const cleanParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
};
