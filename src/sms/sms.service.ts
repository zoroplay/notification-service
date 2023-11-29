import { Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import axios from 'axios';

@Injectable()
export class SmsService {
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
