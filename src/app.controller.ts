import { Controller, Get, InternalServerErrorException, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get('ok')
  getOk() {
    this.logger.log('OK endpoint hit: returning 200');
    return { status: 'OK', timestamp: new Date().toISOString() };
  }

  @Get('fail')
  getFail() {
    this.logger.error('FAIL endpoint hit: throwing 500');
    throw new InternalServerErrorException('Simulated failure');
  }
}
