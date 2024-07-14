import { DynamicModule, Module } from '@nestjs/common';
import {
  CB_HTTP_OPTIONS_TOKEN,
  CB_WS_QUEUE_TOKEN,
  CoinbaseModuleOption,
  MODULE_OPTIONS,
} from './coinbase-module-option';
import { CoinbaseUpstreamClient } from './coinbase-upstream.client';
import { HttpModule } from '../http/http.module';
import { HttpModuleAsyncOptions } from '../http/http.types';
import { RetryInterceptor } from '../http/interceptors';
import { CoinbaseRestApiAuthInterceptor } from './interceptors/coinbase-rest-api-auth.interceptor';
import { CoinbaseWsClient } from './coinbase-ws-client';
import { BullModule } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Module({})
export class CoinbaseClientModule {
  static register(option: CoinbaseModuleOption): DynamicModule {
    console.log(option);
    const httpOptions: HttpModuleAsyncOptions = option.httpOptions || {};
    return {
      module: CoinbaseClientModule,
      imports: [
        BullModule.registerQueue({ name: option.queueOptions.queueName }),
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
        {
          provide: CB_WS_QUEUE_TOKEN,
          useFactory: () => {
            return new Queue(option.queueOptions.queueName);
          },
        },
        CoinbaseUpstreamClient,
        CoinbaseWsClient,
      ],
      exports: [CoinbaseUpstreamClient, CoinbaseWsClient],
    };
  }
}
