import { Module } from '@nestjs/common';
import { CoinbaseClientModule } from '../coinbase-client/coinbase-client.module';
import { S8FdApiService } from './s8-fd-api.service';
import { S8FdApiController } from './s8-fd-api.controller';

@Module({
  imports: [
    CoinbaseClientModule.register({
      httpOptions: {
        apiKey: process.env.CB_API_KEY,
        secret: process.env.CB_API_SECRET,
        passPhrase: process.env.CB_API_PASS_PHRASE,
        axiosOptions: {
          baseURL: process.env.CB_API_BASE_URL,
        },
      },
      wssOptions: {
        directMarketWsUri: process.env.CB_DIRECT_MARKET_WS_URI,
        marketWsUri: process.env.CB_MARKET_WS_URI,
      },
    }),
  ],
  providers: [S8FdApiService],
  controllers: [S8FdApiController],
})
export class S8FdApiModule {}
