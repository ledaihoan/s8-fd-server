import { Inject, Injectable } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';

import { AXIOS_INSTANCE_TOKEN } from './http.constants';
import {
  AxiosRequestConfigWithCustomData,
  AxiosResponseWithCustomData,
} from './http.types';

@Injectable()
export class HttpService {
  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    private readonly instance: AxiosInstance = Axios,
  ) {}

  request<T = any>(
    config: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.instance.request(config);
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.request({ ...config, url, method: 'get' });
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.request({ ...config, url, method: 'delete' });
  }

  head<T = any>(
    url: string,
    config?: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.request({ ...config, url, method: 'head' });
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.request({ ...config, url, method: 'post', data });
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.request({ ...config, url, method: 'put', data });
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.request({ ...config, url, method: 'patch', data });
  }

  get axiosRef(): AxiosInstance {
    return this.instance;
  }
}
