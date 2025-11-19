// src/kubectl.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { KubectlService } from './kubectl.service';

@Controller('k8s')
export class KubectlController {
  constructor(private readonly kubectlService: KubectlService) {}

  // GET /k8s/pods?namespace=backend
  @Get('pods')
  async getPods(@Query('namespace') namespace = 'default') {
    const pods = await this.kubectlService.listPods(namespace);
    return { namespace, pods };
  }

  // GET /k8s/logs?namespace=backend&pod=backend-deployment-6b95f8df5-9l7hl
  @Get('logs')
  async getLogs(
    @Query('namespace') namespace: string,
    @Query('pod') podName: string,
    @Query('tail') tail?: string,
  ) {
    const tailLines = tail ? parseInt(tail, 10) : 200;
    const logs = await this.kubectlService.getPodLogs(namespace, podName, tailLines);
    return { namespace, podName, tailLines, logs };
  }
}
