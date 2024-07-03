import { Injectable } from '@nestjs/common';
import {
  AxiosRequestConfigWithCustomData,
  AxiosResponseWithCustomData,
} from '../http/http.types';
import { HttpService } from '../http/http.service';

@Injectable()
export class CoinbaseUpstreamClient {
  constructor(private readonly httpService: HttpService) {}

  request<T = any>(
    config: AxiosRequestConfigWithCustomData,
  ): Promise<AxiosResponseWithCustomData<T>> {
    return this.httpService.request(config);
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
}
