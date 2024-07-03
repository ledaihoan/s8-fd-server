import { DynamicModule, Module } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';
import * as _ from 'lodash';
import qs from 'qs';

import {
  AXIOS_INSTANCE_TOKEN,
  AXIOS_INTERCEPTORS,
  HTTP_MODULE_ID,
} from './http.constants';
import { HttpService } from './http.service';
import { HttpInterceptor, HttpModuleAsyncOptions } from './http.types';
import { generateRandomString } from '../utils/text.util';

@Module({
  controllers: [],
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {
  static registerAsync(options: HttpModuleAsyncOptions = {}): DynamicModule {
    return {
      module: HttpModule,
      imports: options.imports,
      providers: [
        ...(options.providers || []),
        {
          provide: HTTP_MODULE_ID,
          useValue: generateRandomString(20),
        },
        {
          provide: AXIOS_INTERCEPTORS,
          inject: options.interceptorsInject || options.inject,
          useFactory: async (...args) => {
            if (options.interceptorsFactory) {
              return options.interceptorsFactory(...args);
            }

            return [];
          },
        },
        {
          provide: AXIOS_INSTANCE_TOKEN,
          inject: [AXIOS_INTERCEPTORS, ...(options.inject || [])],
          useFactory: async (interceptors: HttpInterceptor[], ...args) => {
            let instance: AxiosInstance;

            if (options.useFactory) {
              instance = await options.useFactory(...args);
            } else {
              instance = Axios.create(
                _.defaults({}, options.axiosOptions, {
                  paramsSerializer: (params: any) => qs.stringify(params),
                }),
              );
            }

            _.forEach(interceptors, (interceptor) => {
              interceptor.setInstance(instance);

              instance.interceptors.request.use(
                interceptor.requestOnFulfilled.bind(interceptor),
                interceptor.requestOnError.bind(interceptor),
              );

              instance.interceptors.response.use(
                interceptor.responseOnFulfilled.bind(interceptor),
                interceptor.responseOnError.bind(interceptor),
              );
            });

            return instance;
          },
        },
      ],
      exports: [AXIOS_INSTANCE_TOKEN],
    };
  }
}
