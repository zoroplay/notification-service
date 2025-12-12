/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientIdRequest, CommonResponseObj, CreateMessageRequest, FindOneMessage, GetUserNotificationsRequest, SendMessageRequest } from 'src/proto/noti.pb';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}


  async findAllMessages(payload: ClientIdRequest): Promise<CommonResponseObj> {
    try {
      const messages = await this.prisma.messages.findMany({
        where: { clientID: payload.clientId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Messages fetched successfully',
        data: messages
      };
    } catch (err) {
       console.error(err);
        return {
            success: false,
            message: "",
            status: HttpStatus.BAD_REQUEST,
            errors: err.message,
            data: null,
        };
    }
  }

  async findUserMessages(payload: GetUserNotificationsRequest): Promise<CommonResponseObj> {
    try {
      const messages = await this.prisma.user_Messages.findMany({
        where: { userID: payload.userId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Messages fetched successfully',
        data: messages
      };
    } catch (err) {
       console.error(err);
        return {
            success: false,
            message: "",
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
        where: { clientID: clientId, id }
      });

      if (!message) {
        return {
            success: false,
            message: `Could not find banner with messageId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message created successfully',
        data: message
      };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "",
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
            message: `Could not find banner with bannerId ${id}`,
            status: HttpStatus.BAD_REQUEST,
            data: null,
        };
      }

      await this.prisma.messages.delete({ where: { id } });
       return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner deleted successfully',
        data: {}
      };
    } catch (err) {
     console.error(err);
        return {
            success: false,
            message: "",
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
        Object.entries(data).filter(([key, value]) => 
            value !== undefined && key !== 'clientId'
        )
        );

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
        return {
            success: false,
            message: "No valid fields provided for update",
            status: HttpStatus.BAD_REQUEST,
            errors: "At least one field must be provided for update",
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
        data: updatedMessage
        };

    } catch (err) {
        console.error('Error updating message:', err);
        return {
        success: false,
        message: "Failed to update message",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: err.message,
        data: null,
        };
    }
  }

  async createMessage(data: CreateMessageRequest): Promise<CommonResponseObj> {
    try {

      const banner = await this.prisma.messages.create({
        data: {
          title: data.title,
          clientID: data.clientId,
          content: data.content
        },
    
      });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Message created successfully',
        data: banner
      };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "",
            status: HttpStatus.BAD_REQUEST,
            errors: err.message,
            data: null,
        };
    }
  }

  // async sendMessage(data: SendMessageRequest): Promise<CommonResponseObj> {
  //   try {

  //     const banner = await this.prisma.messages.create({
  //       data: {
  //         title: data.title,
  //         clientID: data.clientId,
  //         content: data.content
  //       },
    
  //     });
  //     return {
  //       status: HttpStatus.OK,
  //       success: true,
  //       message: 'Banner created successfully',
  //       data: banner
  //     };
  //   } catch (err) {
  //       console.error(err);
  //       return {
  //           success: false,
  //           message: "",
  //           status: HttpStatus.BAD_REQUEST,
  //           errors: err.message,
  //           data: null,
  //       };
  //   }
  // }
  
}
