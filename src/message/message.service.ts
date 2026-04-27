/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ClientIdRequest,
  CommonResponseObj,
  CreateMessageRequest,
  FindOneMessage,
  GetUserNotificationsRequest,
  SendMessageRequest,
} from 'src/proto/noti.pb';
import { IdentityService } from 'src/identity/identity.service';
import { BettingService } from 'src/betting/betting.service';
import { SmsService } from 'src/sms/sms.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private readonly identityService: IdentityService,
    private readonly bettingService: BettingService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  private parseMetadata(metadataJson?: string): Record<string, any> {
    if (!metadataJson) return {};
    try {
      return JSON.parse(metadataJson);
    } catch {
      return {};
    }
  }

  private buildSimulatedUsers(clientId: number, count = 10) {
    return Array.from({ length: count }, (_, idx) => {
      const userId = idx + 1;
      const phoneNumber =
        idx === 0 ? '2348137048054' : `2557000000${String(userId).padStart(2, '0')}`;
      const emailAddress =
        idx === 0
          ? 'godfather.franklyn@gmail.com'
          : `test.user${userId}@example.com`;
      return {
        client_id: clientId,
        userId,
        segment_code: 'SIMULATED_TEST',
        username: phoneNumber,
        assigned_at_unix: Date.now(),
        emailAddress,
        metadataJson: JSON.stringify({
          avg_bet: 75000,
          vip_level: 5,
        }),
      };
    });
  }

  async findAllMessages(payload: ClientIdRequest): Promise<CommonResponseObj> {
    try {
      const messages = await this.prisma.messages.findMany({
        where: { clientID: payload.clientId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Messages fetched successfully',
        data: messages,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: '',
        status: HttpStatus.BAD_REQUEST,
        errors: err.message,
        data: null,
      };
    }
  }

  async findUserMessages(
    payload: GetUserNotificationsRequest,
  ): Promise<CommonResponseObj> {
    try {
      const messages = await this.prisma.user_Messages.findMany({
        where: { userID: payload.userId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Messages fetched successfully',
        data: messages,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: '',
        status: HttpStatus.BAD_REQUEST,
        errors: err.message,
        data: null,
      };
    }
  }

  async findOneMessage(payload: FindOneMessage): Promise<CommonResponseObj> {
    try {
      const { clientId, id } = payload;

      const message = await this.prisma.messages.findUnique({
        where: { clientID: clientId, id },
      });

      if (!message) {
        return {
          success: false,
          message: `Could not find message with messageId ${id}`,
          status: HttpStatus.BAD_REQUEST,
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message created successfully',
        data: message,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: '',
        status: HttpStatus.BAD_REQUEST,
        errors: err.message,
        data: null,
      };
    }
  }

  async deleteMessage(payload: FindOneMessage): Promise<CommonResponseObj> {
    try {
      const { clientId, id } = payload;

      // Check if role exists and has users
      const message = await this.prisma.messages.findUnique({
        where: { clientID: clientId, id },
      });

      if (!message) {
        return {
          success: false,
          message: `Could not find message with messageId ${id}`,
          status: HttpStatus.BAD_REQUEST,
          data: null,
        };
      }

      await this.prisma.messages.delete({ where: { id } });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message deleted successfully',
        data: {},
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: '',
        status: HttpStatus.BAD_REQUEST,
        errors: err.message,
        data: null,
      };
    }
  }

  async updateMessage(data: CreateMessageRequest): Promise<CommonResponseObj> {
    try {
      // Remove undefined values and exclude clientId from update data
      const updateData = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) => value !== undefined && key !== 'clientId',
        ),
      );

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'No valid fields provided for update',
          status: HttpStatus.BAD_REQUEST,
          errors: 'At least one field must be provided for update',
          data: null,
        };
      }

      // Update the banner (this will throw if banner doesn't exist)
      const updatedMessage = await this.prisma.messages.update({
        where: { id: data.id },
        data: updateData,
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message updated successfully',
        data: updatedMessage,
      };
    } catch (err) {
      console.error('Error updating message:', err);
      return {
        success: false,
        message: 'Failed to update message',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: err.message,
        data: null,
      };
    }
  }

  async createMessage(data: CreateMessageRequest): Promise<CommonResponseObj> {
    try {
      const messageData: Prisma.MessagesCreateInput = {
        title: data.title,
        clientID: data.clientId,
        content: data.content,
        segment: data.segment,
        imageUrl: data.imageUrl,
      };

      const message = await this.prisma.messages.create({
        data: messageData,
      });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message created successfully',
        data: message,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: '',
        status: HttpStatus.BAD_REQUEST,
        errors: err.message,
        data: null,
      };
    }
  }

  async sendMessage(data: SendMessageRequest): Promise<CommonResponseObj> {
    try {
      console.log('data', data);

      const dbMessage = await this.prisma.messages.findFirst({
        where: {
          id: data.messageId,
          clientID: data.clientId,
        },
      });

      console.log('dbMessage', dbMessage);

      if (!dbMessage?.content) {
        return {
          success: false,
          message: 'Message content not found',
          status: HttpStatus.BAD_REQUEST,
          data: null,
        };
      }

      const messageText = dbMessage.content;

      const clientSettings = await this.identityService.getClientSettings({
        clientId: data.clientId,
        category: 'general',
      });

      const settings = clientSettings?.data || [];

      const settingsMap = Object.fromEntries(
        settings.map((s) => [s.option, s.value]),
      );

      const isEmailEnabled = settingsMap.enable_email_notifications === '1';
      const isSmsEnabled = settingsMap.enable_sms_notifications === '1';

      console.log({ isEmailEnabled, isSmsEnabled });

      if (!isEmailEnabled && !isSmsEnabled) {
        return {
          status: HttpStatus.OK,
          success: true,
          message: 'Both email and SMS notifications are disabled for this client',
          data: {
            totalUsers: 0,
            simulationUsed: false,
            channels: {
              sms: { enabled: false, success: 0, failed: 0 },
              email: { enabled: false, success: 0, failed: 0 },
            },
          },
        };
      }

      let cursor: string | undefined = '1';
      let hasMore = true;
      const limit = 50;
      const users: any[] = [];

      if (data.segment) {
        while (hasMore) {
          const response = await this.bettingService.GetUsersBySegment({
            clientId: data.clientId,
            segmentCode: data.segment,
            limit,
            cursor: cursor || '1',
            assignedAfterUnix: 0,
          });

          const pageUsers = response?.users || [];
          users.push(...pageUsers);

          console.log(`Fetched ${pageUsers.length} users (cursor: ${cursor})`);

          if (!pageUsers.length) break;

          if (response.nextCursor) {
            cursor = response.nextCursor;
          } else {
            hasMore = false;
          }
        }
      }

      let activeUsers = users;
      let simulationUsed = false;

      if (!activeUsers.length) {
        simulationUsed = true;
        activeUsers = this.buildSimulatedUsers(data.clientId, 1);
      }

      let smsSuccess = 0;
      let smsFailed = 0;
      let emailSuccess = 0;
      let emailFailed = 0;

      console.log('activeUsers', activeUsers[0]);

      const BATCH_SIZE = 50;
      for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
        const batch = activeUsers.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
          batch.map(async (user) => {
            const meta = this.parseMetadata(user.metadataJson);
            const phoneNumber = user.username;
            const operator = meta.operator || 'VODACOM';
            const email = user.emailAddress;
            const emailFrom =
              process.env.SENDGRID_FROM_EMAIL || 'no-reply@bwinners.com';

            if (isSmsEnabled && phoneNumber) {
              try {
                await this.smsService.handleSMS({
                  clientID: data.clientId,
                  phoneNumber,
                  operator,
                  message: messageText,
                });
                smsSuccess++;
              } catch (smsErr) {
                smsFailed++;
                console.error(`SMS failed for user ${user.userId}:`, smsErr?.message);
              }
            }

            if (isEmailEnabled && email) {
              try {
                await this.emailService.sendEmail({
                  to: email,
                  from: emailFrom,
                  subject: `Message Notification (${data.clientId})`,
                  text: messageText,
                  html: `<p>${messageText}</p>`,
                });
                emailSuccess++;
              } catch (emailErr) {
                emailFailed++;
                console.error(
                  `Email failed for user ${user.userId}:`,
                  emailErr?.message,
                );
              }
            }
          }),
        );
      }
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message processing completed successfully',
        data: {
          totalUsers: activeUsers.length,
          simulationUsed,
          channels: {
            sms: {
              enabled: isSmsEnabled,
              success: smsSuccess,
              failed: smsFailed,
            },
            email: {
              enabled: isEmailEnabled,
              success: emailSuccess,
              failed: emailFailed,
            },
          },
        },
      };
    } catch (err) {
      console.error(err);

      return {
        success: false,
        message: '',
        status: HttpStatus.BAD_REQUEST,
        errors: err.message,
        data: null,
      };
    }
  }
}
