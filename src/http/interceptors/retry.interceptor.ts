import { Injectable, Scope } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';

import { AxiosRequestConfigWithCustomData } from '../http.types';

import { BaseHttpInterceptor } from './base-http.interceptor';
import {
  exponentialDelay,
  getCurrentState,
  getRequestOptions,
  isNetworkOrIdempotentRequestError,
  shouldRetry,
} from './is-retry-allowed.utils';

@Injectable({ scope: Scope.TRANSIENT })
export class RetryInterceptor extends BaseHttpInterceptor {
  requestOnFulfilled(
    config: AxiosRequestConfigWithCustomData,
  ): AxiosRequestConfig<any> & Record<string, any> {
    const currentState = getCurrentState(config);
    currentState.lastRequestTime = Date.now();

    return super.requestOnFulfilled(config);
  }

  async responseOnError(error: AxiosError): Promise<never> {
    const { config } = error;

    if (!config) {
      throw error;
    }

    const {
      retries = 3,
      retryCondition = isNetworkOrIdempotentRequestError,
      retryDelay = exponentialDelay,
    } = getRequestOptions(config);

    const currentState = getCurrentState(config);

    if (await shouldRetry(retries, retryCondition, currentState, error)) {
      currentState.retryCount += 1;
      const delay = retryDelay(currentState.retryCount, error);
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.instance.request(config)), delay);
      });
    }

    throw error;
  }
}
