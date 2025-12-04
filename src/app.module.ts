import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KubectlController } from './kubectl.controller';
import { LmService } from './lm.service';

@Module({
  imports: [],
  controllers: [AppController, KubectlController],
  providers: [AppService, LmService],
})
export class AppModule {}
