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
  let message = 'Something went wrong (Internal Server Error 502)';
  if (error.response?.data?.message) {
    message = error.response?.data.message;
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
