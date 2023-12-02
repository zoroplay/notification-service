/* eslint-disable prettier/prettier */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import 'dotenv/config';
import { protobufPackage } from './noti.pb';

// import { protobufPackage } from './proto/noti.pb';
const logger = new Logger('NOTI_SVC');

const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));


  const uri = `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`
  console.log(`uri ${uri}`)

  // microservice #1
  const microserviceGrpc = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `${uri}`,
      package: protobufPackage,
      protoPath: join('proto/noti.proto'),
    }
  });

  await app.startAllMicroservices();

  await app.listen(5003);
}

bootstrap();
