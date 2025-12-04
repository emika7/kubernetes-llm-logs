import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as util from 'util';

const execPromise = util.promisify(exec);

@Injectable()
export class KubectlService {
  // Gauti podų sąrašą nurodytame namespace
  async listPods(namespace = 'default'): Promise<string[]> {
    const cmd = `kubectl get pods -n ${namespace} -o json`;

    const { stdout } = await execPromise(cmd);

    const data = JSON.parse(stdout);
    const items = data.items ?? [];
    return items
      .map((p: any) => p.metadata?.name)
      .filter((name: string | undefined) => !!name);
  }

  // Gauti konkretaus pod'o logus nurodytame namespace
  async getPodLogs(
    namespace: string,
    podName: string,
    tailLines = 200,
  ): Promise<string> {
    const cmd = `kubectl logs ${podName} -n ${namespace} --tail=${tailLines}`;
    const { stdout } = await execPromise(cmd);
    return stdout;
  }
}
