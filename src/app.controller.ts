import { Controller, Get } from '@nestjs/common';
import {GrpcMethod} from "@nestjs/microservices";
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('NotificationService', 'SendSMS')
  sendSMS(): string {
    return this.appService.getHello();
  }
}
