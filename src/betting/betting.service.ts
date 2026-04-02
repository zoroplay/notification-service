/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GetUsersRequest,
  BETTING_SERVICE_NAME,
  BettingServiceClient,
  protobufPackage
} from 'src/proto/betting.pb';

@Injectable()
export class BettingService {
  private svc: BettingServiceClient;

  @Inject(protobufPackage)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<BettingServiceClient>(
      BETTING_SERVICE_NAME,
    );
  }

  GetUsersBySegment(data: GetUsersRequest) {
    return firstValueFrom(this.svc.getUsersBySegment(data));
  }

}
