/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import axios from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisStore } from 'cache-manager-redis-store';
import { MessageData, SendSMSDTO } from './dto/send-sms.dto';
import { Settings } from '@prisma/client';
import {
  SaveSettingsRequest,
  SaveSettingsResponse,
  SendOtpRequest, SendSmsRequest,
  VerifyOtpRequest,
  GetSettingsRequest,
  SettingData,
} from 'src/proto/noti.pb';

@Injectable()
export class SmsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cache: Cache
  ) {
  }

  async saveSettings(_request: SaveSettingsRequest): Promise<SaveSettingsResponse> {
    try {
      const data = {
        displayName: _request.displayName,
        gatewayName: _request.gatewayName,
        apiKey: _request.apiKey,
        username: _request.username,
        password: _request.password,
        status: _request.enable,
        senderID: _request.senderID,
        clientID: _request.clientId
      };

      if (_request.settingsID) {
        const is_settings_id = await this.prisma.settings.findUnique({
          where: {
            id: _request.settingsID,
          },
        });

        if (!is_settings_id)
          return { status: false, message: `The Id sent does not exist in database, verify` }

        await this.prisma.settings.update({
          where: {
            id: _request.settingsID,
          },
          data
        });


        if (is_settings_id.status) {
          await this.prisma.settings.updateMany({
            where: {
              id: {
                not: _request.settingsID,
              },
            },
            data: {
              status: false,
            },
          });
        }
      } else {
        const newSetting = await this.prisma.settings.create({ data });


        if (newSetting.status) {
          await this.prisma.settings.updateMany({
            where: {
              id: {
                not: newSetting.id,
              },
            },
            data: {
              status: false
            },
          });
        }

      }
      return { status: true, message: 'Settings saved sucessfully' }
    } catch (error) {
      return { status: false, message: `Failed to send SMS: ${error.message}` }
    }
  }

  async getSettings({ clientId }: GetSettingsRequest): Promise<any> {

    let data = [] as SettingData[];
    const settings = await this.prisma.settings.findMany({
      where: { clientID: clientId },
    });

    // build data
    if (settings.length) {
      for (const setting of settings) {
        data.push({
          id: setting.id,
          senderID: setting.senderID,
          displayName: setting.displayName,
          gatewayName: setting.gatewayName,
          apiKey: setting.apiKey,
          status: setting.status,
          username: setting.username,
          password: setting.password,
        })
      }
    }

    return { status: true, message: 'Settings retrieved successfully', data };
  }

  async handleVerifyOTP(request: VerifyOtpRequest) {
    const key = `otp:${request.phoneNumber}`;

    const storedOtp = await this.cache.get(key);

    if (storedOtp === request.otpCode) {
      await this.cache.del(key); // Delete OTP after successful verification
      return { status: true, message: 'Verified' };
    }

    return { status: false, message: 'Wrong Otp Code' };

  }

  async handleOTP(request: SendOtpRequest) {

    const smsProvider = await this.prisma.settings.findFirst({
      where: {
        status: true,
        clientID: request.clientID
      }
    })

    if (smsProvider) {
      console.log(smsProvider)
      const otp = await this.generateOtp(request.phoneNumber, request.clientID);
      const data = {
        sender: smsProvider.senderID,
        receiver: request.phoneNumber,
        message: `Your ${smsProvider.gatewayName} confirmation code is ${otp}`
      }

      switch (smsProvider.gatewayName) {
        case 'yournotify':
          return this.sendMessageYourNotify(data, smsProvider);
        case 'mtech':
          return this.sendMessageMetch(data, smsProvider);
        case 'nanobox':
          return this.sendMessageNanoBox(data, smsProvider);
        default:
          break;
      }
    } else {


    }
  }

  async handleSms(request: SendSmsRequest) {

    const smsProvider = await this.prisma.settings.findFirst({
      where: {
        status: true,
        clientID: request.clientID
      }
    })

    if (smsProvider) {
      const data = {
        sender: smsProvider.senderID,
        receiver: JSON.stringify(request.phoneNumbers),
        message: request.text
      }
      switch (smsProvider.gatewayName) {
        case 'yournotify':
          return this.sendMessageYourNotify(data, smsProvider);
        case 'mtech':
          return this.sendMessageMetch(data, smsProvider);
        case 'nanobox':
          return this.sendMessageNanoBox(data, smsProvider);
        default:
          break;
      }
    } else {


    }
  }

  async sendMessageNanoBox(messageData: MessageData, smsProvider: SettingData): Promise<any> {
    try {

      // const otp = await Promise.all(request.lists.map((item) => {
      // }))
      const response: {
        status: boolean;
        data: any;
      }
        = await axios.post(
          'https://vas.interconnectnigeria.com/nanobox/api/v1/sms/mt',
          {
            sourceMsisdn: messageData.sender,
            destinationMsisdn: messageData.receiver,
            allowDelivery: true,
            messageContent: messageData.message,
            routeAuth: {
              systemId: smsProvider.username,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${smsProvider.apiKey}`
            },
          },
        )

      if (response.status === false) {
        // save message as failed
        this.saveMessage({ ...messageData, status: false }, smsProvider);
        return { status: false, message: response.data.message }
      } else {
        // save message as success
        this.saveMessage({ ...messageData, status: true }, smsProvider);
        return { status: true, message: response.data };
      }

    } catch (error) {
      return { status: false, message: `Failed to send OTP: ${error.message}` }
    }
  }

  async sendMessageYourNotify(messageData: MessageData, smsProvider: SettingData): Promise<any> {
    try {

      const payload = {
        name: smsProvider.displayName,
        from: messageData.sender,
        text: messageData.message,
        status: 'running',
        lists: [messageData.receiver],
        channel: "sms",
      }
      console.log(payload);
      const response: { status: string, message: string, data: any } = await axios.post(
        'https://api.yournotify.com/campaigns/sms', payload, {
        headers: {
          'Authorization': `Bearer ${smsProvider.apiKey}`
        }
      }

      );

      if (response.status === 'failed') {
        // save message as failed
        this.saveMessage({ ...messageData, status: false }, smsProvider);
        return { status: false, message: response.message }
      } else {
        // save message as success
        this.saveMessage({ ...messageData, status: true }, smsProvider);
        return { status: true, message: response.data };
      }
    } catch (error) {
      return { status: false, message: `Failed to send OTP: ${error.message}` }
    }
  }

  async sendMessageMetch(request: MessageData, smsProvider: SettingData): Promise<any> {
    try {

      const response = await axios.post(
        'http://50.200.97.100:8099/sendsms',
        {
          msisdn: request.receiver,
          text: request.message,
          senderId: request.sender,
        },
        {
          headers: {
            'X-Client-Username': smsProvider.username,
            'X-Client-Key': smsProvider.apiKey,
          },
        },
      );

      console.log(response);

      await this.prisma.sms_Records.create({
        data: {
          provider: 'mtech',
          status: Boolean(response.status),
          senderID: request.sender,
          receiverNumber: request.receiver,
          message: request.message

        }
      })

      return { status: true, message: response.data };
    } catch (error) {
      return { status: false, message: `Failed to send SMS: ${error.message}` }
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
      return { status: false, message: `Failed to get Delivery report: ${error.message}` }
    }
  }

  async saveMessage(data, provider) {
    await this.prisma.sms_Records.create({
      data: {
        provider: provider.gatewayName,
        status: Boolean(data.status),
        senderID: data.sender,
        receiverNumber: data.reciever,
        message: data.message
      }
    })
  }

  async generateOtp(phoneNumber: string, clientId: number): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6); // Generate a 6-digit OTP
    const key = `otp:${phoneNumber}:${clientId}`;

    await this.cache.set(key, otp); // Set OTP with a 5-minute expiry time

    return otp;
  }

  async verifyOtp(phoneNumber: string, clientId: number): Promise<boolean> {
    const key = `otp:${phoneNumber}:${clientId}`;

    const storedOtp = await this.cache.get(key);

    if (storedOtp) {
      await this.cache.del(key); // Delete OTP after successful verification
      return true;
    }

    return false;
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
