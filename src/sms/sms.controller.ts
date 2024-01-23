/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { SmsService } from './sms.service';
import { CreateSmDto, SMS_SERVICE_NAME } from './dto/create-sm.dto';
import { SendSMSDTO } from './dto/send-sms.dto';
import { SaveSettingsRequest, SaveSettingsResponse, SendSmsRequest, SendSmsResponse } from 'src/noti.pb';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) { }

  @GrpcMethod(SMS_SERVICE_NAME,'createSms')
  createSms(createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }

  @GrpcMethod(SMS_SERVICE_NAME,'sendOtp')
  async sendOTP(smsRequest: SendSmsRequest): Promise<SendSmsResponse> {
    return this.smsService.handleOTP(smsRequest);
  }
  @GrpcMethod(SMS_SERVICE_NAME,'verifyOtp')
  async verifyOtp(smsRequest: SendSmsRequest): Promise<SendSmsResponse> {
    return this.smsService.handleVerifyOTP(smsRequest);
  }

  @GrpcMethod(SMS_SERVICE_NAME,'sendSms')
  async sendSms(smsRequest: SendSmsRequest): Promise<SendSmsResponse> {
    return this.smsService.handleSms(smsRequest);
  }

  @GrpcMethod(SMS_SERVICE_NAME,'saveSettings')
  async saveSettings( saveSettings: SaveSettingsRequest): Promise<SaveSettingsResponse> {
    return this.smsService.saveSettings(saveSettings);
  }

  @GrpcMethod(SMS_SERVICE_NAME,'deliveryReport')
  async deliveryReport(deliveryReport: SendSMSDTO) {

    return this.smsService.getDeliveryReport(deliveryReport);
  }
}
