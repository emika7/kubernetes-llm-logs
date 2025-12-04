import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { execSync } from 'child_process';


async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/app.log',
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  await app.listen(3000);

  const base = 'http://localhost:3000';

  let podName = "unknown";

try {
  const result = execSync('kubectl get pods -n backend -o json', { encoding: 'utf-8' });
  const json = JSON.parse(result);

  podName = json.items[0]?.metadata?.name || "unknown";
} catch (err) {
  console.error("Failed to fetch pod name:", err);
}


console.log("===============================");
console.log(" Service is running! Click URLs:");
console.log("-------------------------------");
console.log(`Pods endpoint:    http://localhost:3000/k8s/pods?namespace=backend`);
console.log(`Logs endpoint:    http://localhost:3000/k8s/logs?namespace=backend&pod=${podName}&tail=100`);
console.log(`Health endpoint:  http://localhost:3000/k8s/health?namespace=backend&pod=${podName}&tail=10`);
console.log("===============================");
}
bootstrap();
