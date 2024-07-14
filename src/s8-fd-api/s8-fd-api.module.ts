import { Module } from '@nestjs/common';
import { CoinbaseClientModule } from '../coinbase-client/coinbase-client.module';
import { S8FdApiService } from './s8-fd-api.service';
import { S8FdApiController } from './s8-fd-api.controller';
import { S8FdWebsocketGateway } from './s8-fd-websocket.gateway';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: process.env.WS_QUEUE_NAME,
    }),
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
      queueOptions: {
        queueName: process.env.WS_QUEUE_NAME,
      },
    }),
  ],
  providers: [S8FdApiService, S8FdWebsocketGateway],
  controllers: [S8FdApiController],
})
export class S8FdApiModule {}
