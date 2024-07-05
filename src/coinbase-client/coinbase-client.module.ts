import { DynamicModule, Module } from '@nestjs/common';
import {
  CB_HTTP_OPTIONS_TOKEN,
  CoinbaseModuleOption,
  MODULE_OPTIONS,
} from './coinbase-module-option';
import { CoinbaseUpstreamClient } from './coinbase-upstream.client';
import { HttpModule } from '../http/http.module';
import { HttpModuleAsyncOptions } from '../http/http.types';
import { RetryInterceptor } from '../http/interceptors';
import { CoinbaseRestApiAuthInterceptor } from './interceptors/coinbase-rest-api-auth.interceptor';
import { S8FdApiService } from '../s8-fd-api/s8-fd-api.service';

@Module({})
export class CoinbaseClientModule {
  static register(option: CoinbaseModuleOption): DynamicModule {
    const httpOptions: HttpModuleAsyncOptions = option.httpOptions || {};
    return {
      module: CoinbaseClientModule,
      imports: [
        HttpModule.registerAsync({
          imports: [...(httpOptions.imports || [])],
          providers: [
            RetryInterceptor,
            CoinbaseRestApiAuthInterceptor,
            {
              provide: CB_HTTP_OPTIONS_TOKEN,
              useValue: option.httpOptions,
            },
          ],
          axiosOptions: httpOptions.axiosOptions,
          inject: httpOptions.inject,
          interceptorsInject: [
            RetryInterceptor,
            CoinbaseRestApiAuthInterceptor,
            ...(httpOptions.interceptorsInject || httpOptions.inject || []),
          ],
          interceptorsFactory: async (
            authInterceptor: CoinbaseRestApiAuthInterceptor,
            retryInterceptor: RetryInterceptor,
            ...args
          ) => {
            if (httpOptions.interceptorsFactory) {
              const interceptors = await httpOptions.interceptorsFactory(
                ...args,
              );

              return [authInterceptor, retryInterceptor, ...interceptors];
            }
            return [authInterceptor, retryInterceptor];
          },
        }),
      ],
      providers: [
        { provide: MODULE_OPTIONS, useValue: option },
        CoinbaseUpstreamClient,
        S8FdApiService,
      ],
      exports: [CoinbaseUpstreamClient],
    };
  }
}
