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
import { SaveSettingsRequest, SaveSettingsResponse, SendOtpRequest, SendSmsRequest, SendSmsResponse, VerifyOtpRequest } from 'src/noti.pb';
import { RedisStore } from 'cache-manager-redis-store';
import { SendSMSDTO } from './dto/send-sms.dto';
import { Settings } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly redisStore!: RedisStore;
  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cache: Cache) {
    this.redisStore = cache.store as unknown as RedisStore;
  }

  async handleVerifyOTP(request: VerifyOtpRequest) {
    const key = `otp:${request.phoneNumber}`;
    const client = this.redisStore.getClient();

    const storedOtp = await client.get(key);

    if (storedOtp === request.otpCode) {
      await client.del(key); // Delete OTP after successful verification
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
      switch (smsProvider.gatewayName) {
        case 'yournotify':
          this.sendOTPYournotify(request, smsProvider);
          break;
        case 'mtech':
          return this.sendOtp(request);
        case 'nanobox':
          return this.sendOTPNanoBox(request,smsProvider);
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
      switch (smsProvider.gatewayName) {
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
          throw new Error(`The Id sent does not exist in database, verify`);

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


  async sendOTPNanoBox(request: SendOtpRequest, smsProvider: Settings): Promise<any> {
    try {


      const otp = await this.generateOtp(request.phoneNumber)
      // const otp = await Promise.all(request.lists.map((item) => {
      // }))
        const response  : {
          status: boolean;
          data: any;
  
        }
        = await axios.post(
          'https://vas.interconnectnigeria.com/nanobox/api/v1/sms/mt',
          {
            sourceMsisdn: 'CubebetNG',
            destinationMsisdn: request.phoneNumber,
            allowDelivery: true,
            messageContent: `Your ${smsProvider.gatewayName} confirmation code is ${otp}`,
            routeAuth: {
              systemId: process.env.NANOBOX_SYSTEMID,
            },
          },
          {
            headers: {
              authorization: `BEARER ${process.env.NANOBOX_AUTH_KEY}`,
            },
          },
          )

    
        await this.prisma.sms_Records.create({
          data: {
            provider: 'nanobox',
            status: Boolean(response.status),
            senderID: 'CubebetNG',
            receiverNumber: [request.phoneNumber],
            message: response.data


          }
        })
        if(response.status === false ) return  { status: false, message: response.data.message }
  
      return { status: true, message: response.data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendSMSNanoBox(request: SendSmsRequest): Promise<any> {
    try {
      const response : {
        status: boolean;
        data: any;

      } = await axios.post(
        'https://vas.interconnectnigeria.com/nanobox/api/v1/sms/mt',
        {
          sourceMsisdn: 'CubebetNG',
          destinationMsisdn: request.phoneNumbers,
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
          provider: 'nanobox',
          status: Boolean(response.status),
          senderID: 'CubebetNG',
          receiverNumber: request.phoneNumbers,
          message: response.data
        }
      })
      if(response.status === false ) return  { status: false, message: response.data.message }

      return {status: false, message: response.data };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendOTPYournotify(request: SendOtpRequest, smsProvider: Settings): Promise<any> {
    try {
      const otp = await this.generateOtp(request.phoneNumber)

        const response: {status: string, message: string, data: any} = await axios.post(
          'https://api.yournotify.com/campaigns/sms',
          {
            name: smsProvider.displayName,
            from: 'yournotify',
            text: `Your ${smsProvider.gatewayName} confirmation code is ${otp}`,
            status: 'running',
            lists: [request.phoneNumber],
            channel: "sms",
          }, {
          headers: {
            'authorization': `BEARER ${process.env.YOURNOTIFY_AUTH_KEY}`
          }
        }

        );
        await this.prisma.sms_Records.create({
          data: {
            provider: 'yournotify',
            status: String(response.status) === 'success' ? true : false,
            senderID: 'yournotify',
            receiverNumber: [request.phoneNumber],
            message: response.data

          }
        })


        if(response.status === 'failed' ) return  { status: false, message: response.message }


      return { status: true, message: response.data };
    } catch (error) {
      return { status: false, message: `Failed to send OTP: ${error.message}` }
    }
  }
  async sendSMSYournotify(request: SendSmsRequest): Promise<any> {
    try {
      const response : {status: string, message: string, data: any} = await axios.post(
        'https://api.yournotify.com/campaigns/sms',
        {
          name: request.name,
          from: 'yournotify',
          text: request.text,
          status: 'running',
          lists: request.phoneNumbers,
          channel: "sms",
        }, {
        headers: {
          'authorization': `BEARER ${process.env.YOURNOTIFY_AUTH_KEY}`
        }
      }

      );
      await this.prisma.sms_Records.create({
        data: {
          provider: 'yournotify',
          status: response.status === 'success' ? true : false,          senderID: 'yournotify',
          receiverNumber: request.phoneNumbers,
          message: response.data

        }
      })
      if(response.status === 'failed' ) return  { status: false, message: response.message }

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
          provider: 'mtech',
          status: Boolean(response.status),
          senderID: request.senderID,
          receiverNumber: [],
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
          provider: 'mtech',
          status: Boolean(response.status),
          senderID: request.senderID,
          receiverNumber: [],
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

  async generateOtp(phoneNumber: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6); // Generate a 6-digit OTP
    const key = `otp:${phoneNumber}`;
    const client = this.redisStore.getClient();

    await client.set(key, otp); // Set OTP with a 5-minute expiry time

    return otp;
  }

  async verifyOtp(phoneNumber: string): Promise<boolean> {
    const key = `otp:${phoneNumber}`;
    const client = this.redisStore.getClient();

    const storedOtp = await client.get(key);

    if (storedOtp) {
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
