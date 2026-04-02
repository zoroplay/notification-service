/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GetSettingsRequest,
  IDENTITY_SERVICE_NAME,
  IdentityServiceClient,
  protobufPackage
} from 'src/proto/identity.pb';

@Injectable()
export class IdentityService {
  private svc: IdentityServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<IdentityServiceClient>(
      IDENTITY_SERVICE_NAME,
    );
  }

  getClientSettings(data: GetSettingsRequest) {
    return firstValueFrom(this.svc.getSettings(data));
  }

}
