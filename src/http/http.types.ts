import { ModuleMetadata } from '@nestjs/common';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export type AxiosRequestConfigWithCustomData = AxiosRequestConfig &
  Record<string, any>;

export type AxiosResponseWithCustomData<T = any> = AxiosResponse<T> & {
  config: AxiosRequestConfigWithCustomData;
};

export interface HttpModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  // Axios configuration
  inject?: any[];
  useFactory?: (...args: any) => Promise<AxiosInstance> | AxiosInstance;
  axiosOptions?: AxiosRequestConfig;

  // Interceptor Options
  interceptorsFactory?: (
    ...args: any
  ) => Promise<HttpInterceptor[]> | HttpInterceptor[];
  interceptorsInject?: any[];
}

export interface HttpInterceptor {
  setInstance(instance: AxiosInstance): void;
  requestOnFulfilled: (
    value: AxiosRequestConfigWithCustomData,
  ) =>
    | AxiosRequestConfigWithCustomData
    | Promise<AxiosRequestConfigWithCustomData>;

  requestOnError: (error: any) => Promise<any>;

  responseOnFulfilled: (
    value: AxiosResponseWithCustomData<any>,
  ) => AxiosResponseWithCustomData | Promise<AxiosResponseWithCustomData>;

  responseOnError: (error: any) => Promise<any>;
}
