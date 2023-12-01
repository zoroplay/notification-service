/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import axios from 'axios';
import { SaveSettingsDTO } from './dto/sms-settings.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SmsService {
  constructor(private prisma: PrismaService) {}
  async handleSms(request: any) {
   const smsProvider = await this.prisma.settings.findMany({
      where: {
        status: 1
      }
    })

    if (smsProvider[0].gateway_name.toLowerCase() === 'yournotify'){
      return this.sendSMSYournotify(request)
    } 
    if (smsProvider[0].gateway_name.toLowerCase() === 'mtech'){
      return this.sendSMS(request)
    } 
  }

  async saveSettings(_request: SaveSettingsDTO): Promise<any> {
    try {
      if (_request.settings_id) {
        const is_settings_id = await this.prisma.settings.findUnique({
          where: {
            id: _request.settings_id,
          },
        });

        if (!is_settings_id)
          throw new Error(`The Id sent does not exist in database, verify`);

        await this.prisma.settings.update({
          where: {
            id: _request.settings_id,
          },
          data: {
            ..._request,
          },
        });
      } else {
        await this.prisma.settings.create({
          data: {
            ..._request,
          },
        });
      }
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendSMSYournotify(request: any): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.yournotify.com/campaigns/sms',
        {
          name: request.name,
          from: request.from,
          text: request.text,
          status: request.status,
          lists: request.lists,
          schedule: request.schedule,
          channel: request.channel,
          campaign_type: request.campaign_type,
        },
      );

      return { message: response.data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendSMS(request: any): Promise<any> {
    try {
      const possibleData = [
        'Jarabet',
        'Maxbet247',
        'Citybet.bet',
        'Zukabet',
        'Cefabet',
        'Raimax.bet',
        'Staging',
        'CitybetNig',
        'frapapa',
      ];
      if (!request.text.includes(possibleData)) {
        throw new Error(`A valid sender_id has not been passed`);
      }
      const response = await axios.post(
        'http://50.200.97.100:8099/sendsms',
        {
          msisdn: request.msisdn,
          text: 'This is our message',
          senderId: request.sender_id,
        },
        {
          headers: {
            'X-Client-Username': 'sportbook',
            'X-Client-Key': 'qrbw4fHvAo6be4QG',
          },
        },
      );

      return { message: response.data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async getDeliveryReport(deliveryReportRequest: any): Promise<any> {
    try {
      // Implement the logic to fetch the delivery report from MC@st.
      // You should make HTTP requests to MC@st's reporting URL and process the response.

      // Example response for a delivery report:
      const response: any = {
        status: 'DELIVRD',
        timeSubmitted: '2023-11-01T10:00:00Z',
        timeDelivered: '2023-11-01T10:05:00Z',
        message: 'Message text',
        sender: 'Message sender',
        messageId: '12345',
      };

      return response;
    } catch (error) {
      throw new Error(`Failed to get Delivery report: ${error.message}`);
    }
  }
  create(createSmDto: CreateSmDto) {
    return 'This action adds a new sm';
  }

  findAll() {
    return `This action returns all sms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sm`;
  }

  update(id: number, updateSmDto: UpdateSmDto) {
    return `This action updates a #${id} sm`;
  }

  remove(id: number) {
    return `This action removes a #${id} sm`;
  }
}
