import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { SendSMSDTO } from './dto/send-sms.dto';
import { SaveSettingsDTO } from './dto/sms-settings.dto';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @MessagePattern('createSm')
  create(@Payload() createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }
  @MessagePattern('sendSms')
  async sendSms(@Payload() smsRequest: SendSMSDTO) {
    if (smsRequest.mode === 'mtech') {
      return this.smsService.sendSMS(smsRequest);
    } else {
      return this.smsService.sendSMSYournotify(smsRequest);
    }
  }
  @MessagePattern('saveSettings')
  async saveSettings(@Payload() saveSettings: SaveSettingsDTO) {
    return this.smsService.saveSettings(saveSettings);
  }

  @MessagePattern('deliveryReport')
  async deliveryReport(@Payload() deliveryReport: SendSMSDTO) {
    return this.smsService.getDeliveryReport(deliveryReport);
  }
}
