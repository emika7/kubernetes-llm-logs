import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LmService } from './lm.service';

const execAsync = promisify(exec);

@Controller('k8s')
export class KubectlController {
  constructor(private readonly lmService: LmService) {}

  @Get('pods')
  async getPods(@Query('namespace') namespace = 'backend') {
    const ns = namespace || 'backend';
    const { stdout } = await execAsync(
      `kubectl get pods -n ${ns} -o json`,
    );
    const data = JSON.parse(stdout);

    const pods = data.items.map((item: any) => item.metadata.name);

    return { namespace: ns, pods };
  }

  @Get('logs')
  async getLogs(
    @Query('namespace') namespace = 'backend',
    @Query('pod') pod: string,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const ns = namespace || 'backend';

    const tailLines = 10;

    const { stdout } = await execAsync(
      `kubectl logs ${pod} -n ${ns} --tail=${tailLines}`,
    );

    return {
      namespace: ns,
      podName: pod,
      tailLines,
      logs: stdout,
    };
  }

  @Get('health')
  async getHealth(
    @Query('namespace') namespace = 'backend',
    @Query('pod') pod: string,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const ns = namespace || 'backend';

    const tailLines = 10;

    const { stdout } = await execAsync(
      `kubectl logs ${pod} -n ${ns} --tail=${tailLines}`,
    );

    const analysis = await this.lmService.analyzeLogs(stdout);

    return {
      namespace: ns,
      podName: pod,
      healthSummary: analysis,
    };
  }
}
