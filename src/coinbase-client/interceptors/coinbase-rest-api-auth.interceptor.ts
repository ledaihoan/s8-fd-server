import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import {
  CoinbaseModuleOption,
  MODULE_OPTIONS,
} from '../coinbase-module-option';
import { BaseHttpInterceptor } from '../../http/interceptors';
import { AxiosRequestConfigWithCustomData } from '../../http/http.types';
import { getRequestPath } from '../../utils/http.util';
import { createHmac, decodeBase64 } from '../../utils/encryption.util';

@Injectable()
export class CoinbaseRestApiAuthInterceptor extends BaseHttpInterceptor {
  constructor(@Inject(MODULE_OPTIONS) private options: CoinbaseModuleOption) {
    super();
  }

  requestOnFulfilled(
    config: AxiosRequestConfigWithCustomData,
  ): AxiosRequestConfigWithCustomData {
    const timestamp = moment().unix();
    const passPhrase = this.options.httpOptions.passPhrase;
    const requestPath = getRequestPath(config.url);
    const method = config.method;
    const body = config.data;
    const bodyJson = body ? JSON.stringify(body) : '';
    const message = timestamp + method + requestPath + bodyJson;
    const signedMessage = createHmac(
      message,
      decodeBase64(this.options.httpOptions.secret),
    );
    return super.requestOnFulfilled({
      ...config,
      headers: {
        'CB-ACCESS-KEY': this.options.httpOptions.apiKey,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': passPhrase,
        'CB-ACCESS-SIGN': signedMessage,
        ...config?.headers,
      },
    });
  }
}
