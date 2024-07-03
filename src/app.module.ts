import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S8FdApiModule } from './s8-fd-api/s8-fd-api.module';

@Module({
  imports: [S8FdApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
