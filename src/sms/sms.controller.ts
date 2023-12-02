/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { SendSMSDTO } from './dto/send-sms.dto';
import { SaveSettingsDTO } from './dto/sms-settings.dto';
import { SaveSettingsRequest, SaveSettingsResponse, SendSmsRequest, SendSmsResponse } from 'src/noti.pb';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) { }

  @MessagePattern('createSm')
  create(@Payload() createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }
  @MessagePattern('sendSms')
  async sendSms(@Payload() smsRequest: SendSmsRequest): Promise<SendSmsResponse> {
    return this.smsService.handleSms(smsRequest);
  }
  @MessagePattern('saveSettings')
  async saveSettings(@Payload() saveSettings: SaveSettingsRequest): Promise<SaveSettingsResponse> {
    return this.smsService.saveSettings(saveSettings);
  }

  @MessagePattern('deliveryReport')
  async deliveryReport(@Payload() deliveryReport: SendSMSDTO) {
    return this.smsService.getDeliveryReport(deliveryReport);
  }
}
