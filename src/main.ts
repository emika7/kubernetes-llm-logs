import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { execSync } from 'child_process';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const namespace = 'backend';
  let podName = 'unknown';

  try {
    const result = execSync(`kubectl get pods -n ${namespace} -o json`, {
      encoding: 'utf-8',
    });
    const json = JSON.parse(result);
    podName = json.items[0]?.metadata?.name || 'unknown';
    console.log('Detected backend pod:', podName);
  } catch (err) {
    console.error('Failed to detect pod name via kubectl:', err);
  }

  await app.listen(3000);

  console.log('===============================');
  console.log(' Service is running! Click URLs:');
  console.log('-------------------------------');
  console.log(
    `Pods endpoint:    http://localhost:3000/k8s/pods?namespace=${namespace}`,
  );
  console.log(
    `Logs endpoint:    http://localhost:3000/k8s/logs?namespace=${namespace}&pod=${podName}&tail=100`,
  );
  console.log(
    `Health endpoint:  http://localhost:3000/k8s/health?namespace=${namespace}&pod=${podName}&tail=10`,
  );
  console.log('===============================');

  const intervalMs = 5 * 60 * 1000; 

  setInterval(async () => {
    if (podName === 'unknown') {
      console.warn(
        '[Periodic health] Pod name is unknown, skipping health check',
      );
      return;
    }

    const url = `http://localhost:3000/k8s/health?namespace=${namespace}&pod=${podName}&tail=10`;

    try {
      const res = await axios.get(url);
      console.log(
        '[Periodic health]',
        new Date().toISOString(),
        '\n',
        res.data.healthSummary,
      );
    } catch (err: any) {
      console.error(
        '[Periodic health] Health check failed:',
        err?.message ?? err,
      );
    }
  }, intervalMs);
}

bootstrap();
