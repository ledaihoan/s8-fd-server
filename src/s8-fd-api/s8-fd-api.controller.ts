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
    return this.service.getAllTradingPairs(exchangeProvider);
  }
}
