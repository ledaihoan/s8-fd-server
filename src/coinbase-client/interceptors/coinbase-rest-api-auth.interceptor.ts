import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import {
  CB_HTTP_OPTIONS_TOKEN,
  CoinbaseHttpOptions,
} from '../coinbase-module-option';
import { BaseHttpInterceptor } from '../../http/interceptors';
import { AxiosRequestConfigWithCustomData } from '../../http/http.types';
import { getRequestPath } from '../../utils/http.util';
import { base64ToBinary, createHmac } from '../../utils/encryption.util';

@Injectable()
export class CoinbaseRestApiAuthInterceptor extends BaseHttpInterceptor {
  constructor(
    @Inject(CB_HTTP_OPTIONS_TOKEN)
    private options: CoinbaseHttpOptions,
  ) {
    super();
  }

  requestOnFulfilled(
    config: AxiosRequestConfigWithCustomData,
  ): AxiosRequestConfigWithCustomData {
    const timestamp = moment().unix();
    const passPhrase = this.options.passPhrase;
    const requestPath = getRequestPath(config.url);
    const method = config.method.toUpperCase();
    const body = config.data;
    const bodyJson = body ? JSON.stringify(body) : '';
    const message = timestamp + method + requestPath + bodyJson;
    const signedMessage = createHmac(
      message,
      base64ToBinary(this.options.secret),
    );
    return super.requestOnFulfilled({
      ...config,
      headers: {
        'CB-ACCESS-KEY': this.options.apiKey,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': passPhrase,
        'CB-ACCESS-SIGN': signedMessage,
        ...config?.headers,
      },
    });
  }
}
