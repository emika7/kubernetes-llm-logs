// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { KubectlService } from './kubectl.service';
import { KubectlController } from './kubectl.controller';

@Module({
  imports: [],
  controllers: [AppController, KubectlController],
  providers: [KubectlService],
})
export class AppModule {}
