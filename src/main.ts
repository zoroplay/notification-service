/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import 'dotenv/config';
import { protobufPackage } from './proto/noti.pb';

// import { protobufPackage } from './proto/noti.pb';
// const logger = new Logger('NOTI_SVC');

const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`

async function bootstrap() {

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: uri,
      protoPath: join('node_modules/sbe-service-proto/proto/noti.proto'),
      package: protobufPackage,
    },
  });

  await app.listen();
}

bootstrap();
