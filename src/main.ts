/* eslint-disable prettier/prettier */
import { INestMicroservice, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
// import { protobufPackage } from './proto/noti.pb';
const logger = new Logger('NOTI_SVC');

async function bootstrap() {
  const app: INestMicroservice = await NestFactory.createMicroservice(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        port: process.env.PORT,
        url: '0.0.0.0:50051',
        package: 'notification',
        protoPath: join('src/proto/noti.proto'),
      },
    },
  );
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  

  await app.listen();
}

bootstrap();
