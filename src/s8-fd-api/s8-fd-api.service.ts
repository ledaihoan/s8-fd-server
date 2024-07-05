import { BadRequestException, Injectable } from '@nestjs/common';
import { CoinbaseUpstreamClient } from '../coinbase-client/coinbase-upstream.client';
import { ENABLED_EXCHANGE_PROVIDERS } from './constants';

@Injectable()
export class S8FdApiService {
  constructor(private coinbaseUpstreamClient: CoinbaseUpstreamClient) {}

  async getAllTradingPairsByExchange(exchangeProviderId: string) {
    if (!ENABLED_EXCHANGE_PROVIDERS.has(exchangeProviderId)) {
      throw new BadRequestException(
        `Unsupported exchange ${exchangeProviderId}`,
      );
    }
    const response = await this.coinbaseUpstreamClient.get('/products');
    return response.data;
  }

  async getExchangeProductCandles(
    exchangeProviderId: string,
    productId: string,
  ) {
    if (!ENABLED_EXCHANGE_PROVIDERS.has(exchangeProviderId)) {
      throw new BadRequestException(
        `Unsupported exchange ${exchangeProviderId}`,
      );
    }
    const response = await this.coinbaseUpstreamClient.get(
      `/products/${productId}/candles`,
    );
    return response.data;
  }
}
