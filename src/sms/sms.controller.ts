/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { SendSMSDTO } from './dto/send-sms.dto';
import { SaveSettingsRequest, SaveSettingsResponse, SendSmsRequest, SendSmsResponse } from 'src/noti.pb';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) { }

  @GrpcMethod('NotificationService', 'CreateSms')
  create(@Payload() createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }

  @GrpcMethod('NotificationService', 'SendSms')
  async SendSms(smsRequest: SendSmsRequest): Promise<SendSmsResponse> {
    console.log('Sending SMS')
    return this.smsService.handleSms(smsRequest);
  }

  @GrpcMethod('NotificationService', 'SaveSettings')
  async SaveSettings(saveSettings: SaveSettingsRequest): Promise<SaveSettingsResponse> {
    return this.smsService.saveSettings(saveSettings);
  }

  @GrpcMethod('NotificationService', 'DeliveryReport')
  async DeliveryReport(deliveryReport: SendSMSDTO) {
    return this.smsService.getDeliveryReport(deliveryReport);
  }
}
