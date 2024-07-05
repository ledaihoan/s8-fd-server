import { Controller, Get, Param } from '@nestjs/common';
import { S8FdApiService } from './s8-fd-api.service';

@Controller(['api', 'api/v1'])
export class S8FdApiController {
  constructor(private service: S8FdApiService) {}

  // @Post(':exchangeProvider/tradingPairs/search')
  // async searchTradingPairs(@Body() payload) {}
  @Get(':exchangeProvider/tradingPairs')
  async getAllTradingPairs(
    @Param('exchangeProvider') exchangeProvider: string,
  ) {
    return this.service.getAllTradingPairsByExchange(exchangeProvider);
  }

  @Get(':exchangeProvider/products/:productId/candles')
  async getExchangeProductCandles(
    @Param('exchangeProvider') exchangeProvider: string,
    @Param('productId') productId: string,
  ) {
    return this.service.getExchangeProductCandles(exchangeProvider, productId);
  }

  @Get('coinbase/accounts')
  async getAllAccounts() {
    return this.service.getAllAccounts();
  }
}
