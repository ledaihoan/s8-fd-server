import { DynamicModule, Module } from '@nestjs/common';
import { CoinbaseModuleOption, MODULE_OPTIONS } from './coinbase-module-option';
import { CoinbaseUpstreamClient } from './coinbase-upstream.client';
import { HttpModule } from '../http/http.module';
import { HttpModuleAsyncOptions } from '../http/http.types';
import { RetryInterceptor } from '../http/interceptors';

@Module({})
export class CoinbaseClientModule {
  static register(option: CoinbaseModuleOption): DynamicModule {
    const httpOptions: HttpModuleAsyncOptions = option.httpOptions || {};
    return {
      module: CoinbaseClientModule,
      imports: [
        HttpModule.registerAsync({
          imports: [...(httpOptions.imports || [])],
          providers: [RetryInterceptor],
          axiosOptions: httpOptions.axiosOptions,
          inject: httpOptions.inject,
          interceptorsInject: [
            RetryInterceptor,
            ...(httpOptions.interceptorsInject || httpOptions.inject || []),
          ],
          interceptorsFactory: async (
            retryInterceptor: RetryInterceptor,
            ...args
          ) => {
            if (httpOptions.interceptorsFactory) {
              const interceptors = await httpOptions.interceptorsFactory(
                ...args,
              );

              return [retryInterceptor, ...interceptors];
            }
            return [retryInterceptor];
          },
        }),
      ],
      providers: [
        { provide: MODULE_OPTIONS, useValue: option },
        CoinbaseUpstreamClient,
      ],
      exports: [CoinbaseUpstreamClient],
    };
  }
}
