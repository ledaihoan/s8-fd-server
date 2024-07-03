import { AxiosInstance } from 'axios';

import {
  AxiosRequestConfigWithCustomData,
  AxiosResponseWithCustomData,
  HttpInterceptor,
} from '../http.types';

export class BaseHttpInterceptor implements HttpInterceptor {
  instance!: AxiosInstance;

  setInstance(instance: AxiosInstance) {
    this.instance = instance;
  }

  requestOnFulfilled(config: AxiosRequestConfigWithCustomData) {
    return config;
  }

  requestOnError(error: any) {
    return Promise.reject(error);
  }

  responseOnFulfilled(response: AxiosResponseWithCustomData) {
    return response;
  }

  responseOnError(error: any) {
    return Promise.reject(error);
  }
}
