import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @MessagePattern('createSm')
  create(@Payload() createSmDto: CreateSmDto) {
    return this.smsService.create(createSmDto);
  }
  @MessagePattern('sendSms')
  async sendSms(@Payload() smsRequest: SendSmsRequest) {
    return this.smsService.sendSMS(smsRequest);
  }
}
