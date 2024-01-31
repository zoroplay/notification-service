/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { SendSMSDTO } from './dto/send-sms.dto';
import {
  NOTIFICATION_SERVICE_NAME, SaveSettingsRequest, SaveSettingsResponse,
  SendOtpRequest, SendSmsRequest, SendSmsResponse, VerifyOtpRequest,
  GetSettingsRequest, GetSettingsResponse
} from 'src/proto/noti.pb';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) { }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'createSms')
  createSms(createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'sendOtp')
  async sendOTP(smsRequest: SendOtpRequest): Promise<SendSmsResponse> {
    return this.smsService.handleOTP(smsRequest);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'verifyOtp')
  async verifyOtp(smsRequest: VerifyOtpRequest): Promise<SendSmsResponse> {
    console.log(smsRequest)
    return this.smsService.handleVerifyOTP(smsRequest);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'sendSms')
  async sendSms(smsRequest: SendSmsRequest): Promise<SendSmsResponse> {
    return this.smsService.handleSms(smsRequest);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SaveSettings')
  async SaveSettings(saveSettings: SaveSettingsRequest): Promise<SaveSettingsResponse> {
    return this.smsService.saveSettings(saveSettings);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetSettings')
  async GetSettings(data: GetSettingsRequest): Promise<GetSettingsResponse> {
    const res = await this.smsService.getSettings(data);
    return res;
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'deliveryReport')
  async deliveryReport(deliveryReport: SendSMSDTO) {

    return this.smsService.getDeliveryReport(deliveryReport);
  }
}
