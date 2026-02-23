import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IDENTITY_PACKAGE_NAME, protobufPackage } from 'src/proto/identity.pb';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: protobufPackage,
        transport: Transport.GRPC,
        options: {
          url: process.env.IDENTITY_SERVICE_URL,
          package: IDENTITY_PACKAGE_NAME,
          protoPath: join(
            'node_modules/sbe-service-proto/proto/identity.proto',
          ),
          // Increase gRPC message size limits
          channelOptions: {
            'grpc.max_receive_message_length': 50 * 1024 * 1024, // 50MB
            'grpc.max_send_message_length': 50 * 1024 * 1024, // 50MB
          },
        },
      },
    ]),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
