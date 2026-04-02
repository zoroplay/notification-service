/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BettingService } from './betting.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BETTING_PACKAGE_NAME, protobufPackage } from 'src/proto/betting.pb';
import { join } from 'path';
import 'dotenv/config'


@Module({
  imports: [
    ClientsModule.register([
      {
        name: protobufPackage,
        transport: Transport.GRPC,
        options: {
          url: process.env.BETTING_SERVICE_URL,
          package: BETTING_PACKAGE_NAME,
          protoPath: join('node_modules/sbe-service-proto/proto/betting.proto'),
        },
      },
    ]),
  ],
  providers: [BettingService],
  exports: [BettingService]
})


export class BettingModule {}
