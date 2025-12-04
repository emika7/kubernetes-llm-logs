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

  // GET /k8s/pods?namespace=backend
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

  // GET /k8s/logs?namespace=backend&pod=X
  @Get('logs')
  async getLogs(
    @Query('namespace') namespace = 'backend',
    @Query('pod') pod: string,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const ns = namespace || 'backend';

    // ČIA ↓ pakeičiam į paskutines 10 eilučių
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

  // GET /k8s/health?namespace=backend&pod=X
  @Get('health')
  async getHealth(
    @Query('namespace') namespace = 'backend',
    @Query('pod') pod: string,
  ) {
    if (!pod) {
      throw new BadRequestException('Missing "pod"');
    }

    const ns = namespace || 'backend';

    // Tik paskutinės 10 eilučių
    const tailLines = 10;

    // Pasiimame paskutines 10 logų eilučių iš kubectl
    const { stdout } = await execAsync(
      `kubectl logs ${pod} -n ${ns} --tail=${tailLines}`,
    );

    // Siunčiame šias 10 eilučių į modelį
    const analysis = await this.lmService.analyzeLogs(stdout);

    return {
      namespace: ns,
      podName: pod,
      healthSummary: analysis,
    };
  }
}
