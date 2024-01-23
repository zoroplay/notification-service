/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import axios from 'axios';
import { SaveSettingsDTO } from './dto/sms-settings.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveSettingsRequest, SaveSettingsResponse, SendSmsRequest, SendSmsResponse } from 'src/noti.pb';
import { RedisStore } from 'cache-manager-redis-store';
import { SendSMSDTO } from './dto/send-sms.dto';

@Injectable()
export class SmsService {
  private readonly redisStore!: RedisStore;
  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cache: Cache) {
    this.redisStore = cache.store as unknown as RedisStore;
   }
  
  async handleVerifyOTP(request: SendSmsRequest) {
    await Promise.all(request.lists.map((item) => {
      this.verifyOtp(item)
    }))
    return { status: true, message: 'Verified'};

  }

  async handleOTP(request: SendSmsRequest) {

    const smsProvider = await this.prisma.settings.findFirst({
      where: {
        status: true,
        clientId: request.clientID
      }
    })

    if (smsProvider) {
      switch (smsProvider.gateway_name) {
        case 'yournotify':
          this.sendOTPYournotify(request);
          break;
        case 'mtech':
          return this.sendSMS(request);
        case 'nanobox':

          return this.sendOTPNanoBox(request);
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
        clientId: request.clientID
      }
    })

    if (smsProvider) {
      switch (smsProvider.gateway_name) {
        case 'yournotify':
          this.sendSMSYournotify(request);
          break;
        case 'mtech':
          return this.sendSMS(request);
        case 'nanobox':
          return this.sendSMSNanoBox(request);
        default:
          break;
      }
    } else {


    }
  }

  async saveSettings(_request: SaveSettingsRequest): Promise<SaveSettingsResponse> {
    try {
      const data = {
        display_name: _request.displayName,
        gateway_name: _request.gatewayName,
        api_key: _request.apiKey,
        username: _request.username,
        password: _request.password,
        status: _request.enable,
        sender_id: _request.senderID,
        clientId: _request.clientId
      };

      if (_request.settingID) {
        const is_settings_id = await this.prisma.settings.findUnique({
          where: {
            id: _request.settingID,
          },
        });

        if (!is_settings_id)
          throw new Error(`The Id sent does not exist in database, verify`);

        await this.prisma.settings.update({
          where: {
            id: _request.settingID,
          },
          data
        });

      
        if (is_settings_id.status) {
          await this.prisma.settings.updateMany({
            where: {
              id: {
                not: _request.settingID,
              },
            },
            data: {
              status: false,
            },
          });
        }
      } else {
        const newSetting =   await this.prisma.settings.create({ data });

       
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


  async sendOTPNanoBox(request: SendSmsRequest): Promise<any> {
    try {
    

      const otp = await Promise.all(request.lists.map((item) => {
        this.generateOtp(item)
      }))
      const response =  await Promise.all(request.lists.map(async (item) => {
    const r =  await axios.post(
      'https://vas.interconnectnigeria.com/nanobox/api/v1/sms/mt',
      {
        sourceMsisdn: 'CubebetNG',
        destinationMsisdn: item,
        allowDelivery: true,
        messageContent:`Your ${request.from} confirmation code is ${otp}`,
        routeAuth: {
          systemId: process.env.NANOBOX_SYSTEMID,
        },
      },
      {
        headers: {
          authorization: `BEARER ${process.env.NANOBOX_AUTH_KEY}`,
        },
      },

      );
      await this.prisma.sms_Records.create({
        data: {
          provider:'nanobox',
          status: Boolean(r.status),
          sender_id: 'CubebetNG',
          receiver_number: [item],
          message: r.data


        }
      })
      return r
      }))
      return { status: true, message: response[0].data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
  async sendSMSNanoBox(request: SendSmsRequest): Promise<any> {
    try {
      const response = await axios.post(
        'https://vas.interconnectnigeria.com/nanobox/api/v1/sms/mt',
        {
          sourceMsisdn: 'CubebetNG',
          destinationMsisdn: request.lists,
          allowDelivery: true,
          messageContent: `Hello ${request.name}, welcome to the CubebetNG family. Your betting code with Care policy has been activated`,
          routeAuth: {
            systemId: process.env.NANOBOX_SYSTEMID,
          },
        },
        {
          headers: {
            authorization: `BEARER ${process.env.NANOBOX_AUTH_KEY}`,
          },
        },
      );

      await this.prisma.sms_Records.create({
        data: {
          provider:'nanobox',
          status: Boolean(response.status),
          sender_id: 'CubebetNG',
          receiver_number: request.lists,
          message: response.data
        }
      })
      return { message: response.data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendOTPYournotify(request: SendSmsRequest): Promise<any> {
    try {
   const otp = await Promise.all(request.lists.map((item) => {
        this.generateOtp(item)
      }))
      const response =  await Promise.all(request.lists.map(async (item) => {
    const r =  await axios.post(
        'https://api.yournotify.com/campaigns/sms',
        {
          name: request.name,
          from: request.from,
          text: `Your ${request.from} confirmation code is ${otp}`,
          status: request.status,
          lists: [item],
          schedule: request.schedule,
          channel: request.channel,
          campaign_type: request.campaignType,
        }, {
        headers: {
          'authorization': `BEARER ${process.env.YOURNOTIFY_AUTH_KEY}`
        }
      }

      );
      await this.prisma.sms_Records.create({
        data: {
          provider:'yournotify',
          status: Boolean(r.status),
          sender_id: request.from,
          receiver_number: [item],
          message: r.data

        }
      })
      return r
      }))
      
      
    

      return { status: true, message: response[0].data };
    } catch (error) {
      return { status: false, message: `Failed to send OTP: ${error.message}` }
    }
  }
  async sendSMSYournotify(request: SendSmsRequest): Promise<any> {
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
          campaign_type: request.campaignType,
        }, {
        headers: {
          'authorization': `BEARER ${process.env.YOURNOTIFY_AUTH_KEY}`
        }
      }

      );
      await this.prisma.sms_Records.create({
        data: {
          provider:'yournotify',
          status: Boolean(response.status),
          sender_id: request.from,
          receiver_number: request.lists,
          message: response.data

        }
      })

      return { status: true, message: response.data };
    } catch (error) {
      return { status: false, message: `Failed to send SMS: ${error.message}` }
    }
  }

  async sendSMS(request: SendSmsRequest): Promise<any> {
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
      if (!possibleData.includes(request.senderID)) {
        throw new Error(`A valid sender_id has not been passed`);
      }
      const response = await axios.post(
        'http://50.200.97.100:8099/sendsms',
        {
          msisdn: request.msisdn,
          text: request.text,
          senderId: request.senderID,
        },
        {
          headers: {
            'X-Client-Username': process.env.MTECH_CLIENT_USERNAME,
            'X-Client-Key': process.env.MTECH_CLIENT_KEY,
          },
        },
      );

     await this.prisma.sms_Records.create({
        data: {
          provider:'mtech',
          status: Boolean(response.status),
          sender_id: request.senderID,
          receiver_number: [],
          message: response.data

        }
      })

      return { status: true, message: response.data };
    } catch (error) {
      return { status: false, message: `Failed to send SMS: ${error.message}` }
    }
  }
  async sendOTP(request: SendSmsRequest): Promise<any> {
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
      if (!possibleData.includes(request.senderID)) {
        throw new Error(`A valid sender_id has not been passed`);
      }
      const response = await axios.post(
        'http://50.200.97.100:8099/sendsms',
        {
          msisdn: request.msisdn,
          text: request.text,
          senderId: request.senderID,
        },
        {
          headers: {
            'X-Client-Username': process.env.MTECH_CLIENT_USERNAME,
            'X-Client-Key': process.env.MTECH_CLIENT_KEY,
          },
        },
      );

     await this.prisma.sms_Records.create({
        data: {
          provider:'mtech',
          status: Boolean(response.status),
          sender_id: request.senderID,
          receiver_number: [],
          message: response.data

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
      throw new Error(`Failed to get Delivery report: ${error.message}`);
    }
  }

  async generateOtp(userId: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6); // Generate a 6-digit OTP
    const key = `otp:${userId}`;
    const client =   this.redisStore.getClient();


    await client.set(key, otp); // Set OTP with a 5-minute expiry time

    return otp;
  }

  async verifyOtp(userId: string): Promise<boolean> {
    const key = `otp:${userId}`;
    const client = this.redisStore.getClient();

    const storedOtp = await client.get(key);

    if (storedOtp ) {
      await client.del(key); // Delete OTP after successful verification
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
