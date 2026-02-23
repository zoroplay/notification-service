import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GetUserDetailsRequest,
  IDENTITY_SERVICE_NAME,
  IdentityServiceClient,
  protobufPackage,
} from 'src/proto/identity.pb';

@Injectable()
export class IdentityService implements OnModuleInit {
  private service: IdentityServiceClient;

  constructor(@Inject(protobufPackage) private client: ClientGrpc) {}

  onModuleInit() {
    this.service = this.client.getService<IdentityServiceClient>(
      IDENTITY_SERVICE_NAME,
    );
  }

  async getUserDetails(data: GetUserDetailsRequest) {
    return await firstValueFrom(this.service.getUserDetails(data));
  }
}
