/* eslint-disable prettier/prettier */
import { existsSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import 'dotenv/config';
import { protobufPackage } from './proto/noti.pb';

const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`;

function resolveNotiProtoPath(): string {
  const candidates = [
    join(__dirname, '..', '..', 'sbe-service-proto', 'proto', 'noti.proto'),
    join(process.cwd(), '..', 'sbe-service-proto', 'proto', 'noti.proto'),
    join(process.cwd(), 'node_modules', 'sbe-service-proto', 'proto', 'noti.proto'),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (found) {
    return found;
  }
  return candidates[candidates.length - 1];
}

async function bootstrap() {
  const protoPath = resolveNotiProtoPath();

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: uri,
      protoPath,
      package: protobufPackage,
    },
  });

  await app.startAllMicroservices();

  const httpPort = parseInt(process.env.HTTP_PORT || '3020', 10);
  await app.listen(httpPort);
}

bootstrap();
