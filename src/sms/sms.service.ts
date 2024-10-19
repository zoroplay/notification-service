/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import axios from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageData } from './dto/send-sms.dto';
import {
  SendOtpRequest,
  SendSmsRequest,
  SettingData,
  Notifications,
} from 'src/proto/noti.pb';
import * as smpp from 'smpp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SmsService implements OnModuleInit {
  protected smppSession;

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  onModuleInit() {
    let isConnected = false;

    this.smppSession = smpp.connect({
      url: 'smpp://10.190.2.253:10010',
      auto_enquire_link_period: 10000,
      debug: true,
    });

    this.smppSession.bind_transceiver(
      {
        system_id: 'Raimax_V01',
        password: 'Raimax@123',
      },
      (pdu) => {
        if (pdu.command_status == 0) {
          console.log('Successfully bound');
          isConnected = true;
        }
      },
    );

    this.smppSession.on('close', () => {
      console.log('smpp is now disconnected');

      if (isConnected) {
        this.smppSession.connect(); //reconnect again
      }
    });

    this.smppSession.on('error', (error) => {
      console.log('smpp error', error);
      isConnected = false;
    });
  }

  async handleVerifyOTP(request) {
    const key = `otp:${request.phoneNumber}:${request.clientID}`;
    const storedOtp = await this.cache.get(key);
    console.log('otp', storedOtp, request);

    if (storedOtp === request.code) {
      await this.cache.del(key); // Delete OTP after successful verification
      return { status: true, message: 'Verified' };
    }

    return { status: false, message: 'Wrong Otp Code' };
  }

  async handleOTP(request: SendOtpRequest) {
    const smsProvider = await this.prisma.settings.findFirst({
      where: {
        status: true,
        clientID: request.clientID,
      },
    });

    if (smsProvider) {
      const otp = await this.generateOtp(request.phoneNumber, request.clientID);
      // console.log('generated', otp);
      const data = {
        sender: smsProvider.senderID,
        receiver: request.phoneNumber,
        message:
          smsProvider.password === 'whatsapp_otp'
            ? otp
            : `Hello, Your ${smsProvider.senderID} confirmation code is ${otp}. Please use within 5 mins`,
      };

      // return { success: true, message: 'Success', status: true };

      switch (smsProvider.gatewayName) {
        case 'yournotify':
          return this.sendMessageYourNotify(data, smsProvider);
        case 'mtech':
          return this.sendMessageMetch(data, smsProvider);
        case 'nanobox':
          return this.sendMessageNanoBox(data, smsProvider);
        case 'termii':
          return this.sendMessageTermii(data, smsProvider);
        default:
          break;
      }
    } else {
      return { status: false, message: 'No SMS gateway found' };
    }
  }

  async handleSms(request: SendSmsRequest) {
    const smsProvider = await this.prisma.settings.findFirst({
      where: {
        status: true,
        clientID: request.clientID,
      },
    });

    if (smsProvider) {
      const data = {
        sender: smsProvider.senderID,
        receiver: JSON.stringify(request.phoneNumbers),
        message: request.text,
      };
      switch (smsProvider.gatewayName) {
        case 'yournotify':
          return this.sendMessageYourNotify(data, smsProvider);
        case 'mtech':
          return this.sendMessageMetch(data, smsProvider);
        case 'nanobox':
          return this.sendMessageNanoBox(data, smsProvider);
        case 'termii':
          return this.sendMessageTermii(data, smsProvider);
        case 'momo':
          return this.sendMessageMomo(data, smsProvider);
        case 'roberms':
          return this.sendMessageRoberms(data, smsProvider);
        default:
          break;
      }
    } else {
    }
  }

  async sendMessageRoberms(
    messageData: MessageData,
    smsProvider: SettingData,
  ): Promise<any> {
    try {
      console.log(45354809);
      const trackingId = uuidv4();

      const response: {
        status: boolean;
        data: any;
      } = await axios.post(
        `${process.env.ROBERMS_SMS_API}`,
        {
          message: messageData.message,
          phone_number: messageData.sender,
          sender_name: smsProvider.username,
          unique_identifier: trackingId,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ROBERMS_APIKEY}`,
          },
        },
      );
      console.log(response.data);
      if (response.data.status === '-1') {
        messageData.status = false;
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
          trackingId: trackingId ? trackingId : null,
        });
        return { status: false, message: response.data.processingNumber };
      } else {
        messageData.status = true;
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
          trackingId: trackingId ? trackingId : null,
        });
        return { status: true, message: response.data.processingNumber };
      }
    } catch (error) {
      console.log(error.message);
      return { status: false, message: `Failed to send OTP: ${error.message}` };
    }
  }
  async sendMessageMomo(
    messageData: MessageData,
    smsProvider: SettingData,
  ): Promise<any> {
    try {
      console.log(45354809);
      const trackingId = uuidv4();
      const response: {
        status: boolean;
        data: any;
      } = await axios.post(
        `${process.env.MOMO_API}`,
        {
          msisdn: messageData.sender,
          operator: 'VODACOM',
          reason: messageData.message,
          senderName: smsProvider.username,
          smsBody: messageData.message,
          transactionId: trackingId,
        },
        {
          headers: {
            apiKey: `${process.env.MOMO_APIKEY}`,
            apiUserName: `${process.env.MOMO_APIUSERNAME}`,
          },
        },
      );
      console.log(response.data);
      if (response.data.status === '-1') {
        messageData.status = false;
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
          trackingId: trackingId ? trackingId : null,
        });
        return { status: false, message: response.data.processingNumber };
      } else {
        messageData.status = true;
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
          trackingId: trackingId ? trackingId : null,
        });
        return { status: true, message: response.data.processingNumber };
      }
    } catch (error) {
      console.log(error.message);
      return { status: false, message: `Failed to send OTP: ${error.message}` };
    }
  }
  async sendMessageNanoBox(
    messageData: MessageData,
    smsProvider: SettingData,
  ): Promise<any> {
    try {
      // const otp = await Promise.all(request.lists.map((item) => {
      // }))
      const response: {
        status: boolean;
        data: any;
      } = await axios.post(
        'https://vas.interconnectnigeria.com/nanobox/api/v1/sms/mt',
        {
          sourceMsisdn: messageData.sender,
          destinationMsisdn: [messageData.receiver],
          allowDelivery: true,
          messageContent: messageData.message,
          routeAuth: {
            systemId: smsProvider.username,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${smsProvider.apiKey}`,
          },
        },
      );
      console.log(response.data);
      if (response.data.status === false) {
        messageData.status = false;
        // save message as failed
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
        });
        return { status: false, message: response.data.data.message };
      } else {
        messageData.status = true;
        // save message as success
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
        });
        return { status: true, message: response.data.data.message };
      }
    } catch (error) {
      console.log(error.message);
      return { status: false, message: `Failed to send OTP: ${error.message}` };
    }
  }

  async sendMessageYourNotify(
    messageData: MessageData,
    smsProvider: SettingData,
  ): Promise<any> {
    try {
      const payload = {
        name: smsProvider.displayName,
        from: messageData.sender,
        text: messageData.message,
        status: 'running',
        lists: [messageData.receiver],
        channel: 'sms',
      };

      const response: { status: string; message: string; data: any } =
        await axios.post('https://api.yournotify.com/campaigns/sms', payload, {
          headers: {
            Authorization: `Bearer ${smsProvider.apiKey}`,
          },
        });

      if (response.data.status === 'failed') {
        messageData.status = false;
        // save message as failed
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
        });
        return { status: false, message: response.data.message };
      } else {
        messageData.status = true;
        // save message as success
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: response.data,
        });
        return { status: true, message: response.data.message };
      }
    } catch (error) {
      return { status: false, message: `Failed to send OTP: ${error.message}` };
    }
  }

  async sendMessageMetch(
    messageData: MessageData,
    smsProvider: SettingData,
  ): Promise<any> {
    try {
      const response = await axios.post(
        'http://50.200.97.100:8099/sendsms',
        {
          msisdn: messageData.receiver,
          text: messageData.message,
          senderId: messageData.sender,
        },
        {
          headers: {
            'X-Client-Username': smsProvider.username,
            'X-Client-Key': smsProvider.apiKey,
          },
        },
      );

      messageData.status = true;
      // save message as success
      this.saveMessage({
        data: messageData,
        provider: smsProvider,
        response: response.data,
      });
      return { status: true, message: response.data };
    } catch (error) {
      this.saveMessage({
        data: messageData,
        provider: smsProvider,
        response: error,
      });
      return { status: false, message: `Failed to send SMS: ${error.message}` };
    }
  }

  async sendMessageTermii(messageData: MessageData, smsProvider: SettingData) {
    try {
      const data = {
        api_key: smsProvider.apiKey,
        type: 'plain',
        channel: smsProvider.password,
        from: smsProvider.senderID,
        sms: messageData.message,
        to: messageData.receiver,
      };
      console.log('termii data', data);
      let resp: any = {};

      resp = await axios.post(`https://api.ng.termii.com/api/sms/send`, data, {
        headers: {
          'Content-Type': ['application/json', 'application/json'],
        },
      });

      if (resp.data.code === 'ok') {
        messageData.status = true;
        // save message as success
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: resp.data,
        });
        return { status: true, message: resp.data.message };
      } else {
        messageData.status = false;
        // save message as success
        this.saveMessage({
          data: messageData,
          provider: smsProvider,
          response: resp.data,
        });
        return { status: true, message: resp.data.message };
      }
    } catch (e) {
      console.log(e.message);
      messageData.status = false;
      // save message as success
      this.saveMessage({
        data: messageData,
        provider: smsProvider,
        response: e,
      });
      return { status: false, message: `Failed to send OTP: ${e.message}` };
    }
  }

  async sendMessageZain(messageData: MessageData) {
    try {
      this.smppSession.submit_sm(
        {
          destination_addr: messageData.receiver,
          short_message: messageData.message,
        },
        function (pdu) {
          if (pdu.command_status == 0) {
            // Message successfully sent
            console.log(pdu.message_id);
          }
        },
      );
    } catch (e) {
      console.log('error sending sms with zain', e.message);
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
      return {
        status: false,
        message: `Failed to get Delivery report: ${error.message}`,
      };
    }
  }

  async saveMessage({
    data,
    provider,
    response,
    trackingId,
  }: {
    data: any;
    provider: any;
    response: any;
    trackingId?: string;
  }) {
    await this.prisma.sms_Records.create({
      data: {
        provider: provider.gatewayName,
        status: Boolean(data.status),
        senderID: data.sender,
        receiverNumber: data.receiver,
        message: data.message,
        gatewayResponse: JSON.stringify(response),
        trackingId: trackingId ? trackingId : null,
      },
    });
  }

  async generateOtp(phoneNumber: string, clientId: number): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .substring(0, 6); // Generate a 6-digit OTP
    const key = `otp:${phoneNumber}:${clientId}`;

    await this.cache.set(key, otp, { ttl: 300 * 1000 }); // Set OTP with a 5-minute expiry time

    return otp;
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
