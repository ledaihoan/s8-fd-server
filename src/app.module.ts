import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S8FdApiModule } from './s8-fd-api/s8-fd-api.module';
import { APP_FILTER } from '@nestjs/core';
import { RethrowAxiosExceptionFilter } from './http/filters';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: +process.env.REDIS_PORT || 6379,
      },
    }),
    S8FdApiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: RethrowAxiosExceptionFilter,
    },
  ],
})
export class AppModule {}
