/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { MessageStatus } from '@prisma/client';
import { IdentityService } from 'src/identity/identity.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ClientIdRequest,
  CommonResponseObj,
  CreateMessageRequest,
  FindOneMessage,
  GetUserNotificationsRequest,
  SendMessageRequest,
} from 'src/proto/noti.pb';

@Injectable()
export class MessageService {
  private logger = new Logger(MessageService.name);
  constructor(
    private prisma: PrismaService,
    private userService: IdentityService,
  ) {}

  async findAllMessages(payload: ClientIdRequest): Promise<CommonResponseObj> {
    try {
      const messages = await this.prisma.message.findMany({
        where: { client_id: payload.clientId },
      });

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Messages fetched successfully',
        data: messages,
      };
    } catch (err) {
      this.logger.error(err.message, err.stack);
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
        where: { user_id: payload.userId },
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

      const message = await this.prisma.user_Messages.findUnique({
        where: { client_id: clientId, id },
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
      const message = await this.prisma.user_Messages.findUnique({
        where: { client_id: clientId, id },
      });

      if (!message) {
        return {
          success: false,
          message: `Could not find banner with bannerId ${id}`,
          status: HttpStatus.BAD_REQUEST,
          data: null,
        };
      }

      await this.prisma.user_Messages.delete({ where: { id } });
      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Banner deleted successfully',
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
        throw new RpcException('No valid fields provided for update');
      }

      // Update the banner (this will throw if banner doesn't exist)
      const updatedMessage = await this.prisma.user_Messages.update({
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
      throw new RpcException('Failed to update message: ' + err.message);
    }
  }

  async createMessage(data: CreateMessageRequest) {
    // try {
    //   const banner = await this.prisma.notificationMessage.create({
    //     data: {
    //       title: data.title,
    //       client_id: data.clientId,
    //       content: data.content,
    //     },
    //   });
    //   return {
    //     status: HttpStatus.OK,
    //     success: true,
    //     message: 'Message created successfully',
    //     data: banner,
    //   };
    // } catch (err) {
    //   console.error(err);
    //   return {
    //     success: false,
    //     message: '',
    //     status: HttpStatus.BAD_REQUEST,
    //     errors: err.message,
    //     data: null,
    //   };
    // }
  }

  async getChatHistory({
    chat_id,
    client_id,
  }: {
    chat_id: string;
    client_id: number;
  }) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
        include: {
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
          participants: true,
        },
      });
      if (!chat) {
        throw new RpcException('Chat not found');
      }
      if (chat.messages.length > 0) {
        for (const message of chat.messages as any) {
          if (message.sender_id) {
            const user = await this.userService.getUserDetails({
              userId: message.sender_id,
              clientId: client_id,
            });
            message.sender = user.data;
          }
        }
      }
      if (chat.participants.length > 0) {
        for (const participant of chat.participants as any) {
          if (participant.user_id) {
            const user = await this.userService.getUserDetails({
              userId: participant.user_id,
              clientId: client_id,
            });
            participant.user = user.data;
          }
        }
      }

      return chat;
    } catch (error) {
      this.logger.error(`Error getting chat history: ${error.message}`);
      throw new RpcException('Failed to get chat history');
    }
  }

  async getMessages({
    chat_id,
    client_id,
  }: {
    chat_id: string;
    client_id: number;
  }) {
    try {
      const messages = await this.prisma.message.findMany({
        where: { chat_id, client_id },
        orderBy: { created_at: 'asc' },
      });
      if (messages.length > 0) {
        for (const message of messages as any) {
          if (message.sender_id) {
            const user = await this.userService.getUserDetails({
              userId: message.sender_id,
              clientId: client_id,
            });

            message.sender = user.data;
          }
        }
      }
      return messages;
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`);
      throw new RpcException('Failed to get messages');
    }
  }

  async getChats({
    user_id,
    client_id,
  }: {
    user_id: number;
    client_id: number;
  }) {
    try {
      const chatsWithLastMessage = await this.prisma.chat.findMany({
        where: {
          client_id,
          participants: { some: { user_id } },
        },
        include: {
          participants: { where: { user_id: { not: user_id } } },
          messages: { orderBy: { created_at: 'desc' }, take: 1 },
        },
      });
      if (chatsWithLastMessage.length > 0) {
        for (const chat of chatsWithLastMessage as any) {
          if (chat.messages.length > 0) {
            for (const message of chat.messages) {
              if (message.sender_id) {
                const user = await this.userService.getUserDetails({
                  userId: message.sender_id,
                  clientId: client_id,
                });
                message.sender = user.data;
              }
            }
          }
          if (chat.participants.length > 0) {
            for (const participant of chat.participants) {
              if (participant.user_id) {
                const user = await this.userService.getUserDetails({
                  userId: participant.user_id,
                  clientId: client_id,
                });
                participant.user = user.data;
              }
            }
          }
        }
      }
      // Sort chats by last message time
      const sortedChats = chatsWithLastMessage.sort((a, b) => {
        const aLastMessageTime = a.messages[0]?.created_at || a.created_at;
        const bLastMessageTime = b.messages[0]?.created_at || b.created_at;
        return (
          new Date(bLastMessageTime).getTime() -
          new Date(aLastMessageTime).getTime()
        );
      });
      for (const chat of sortedChats as any) {
        const participant = await this.prisma.chatParticipant.findFirst({
          where: { chat_id: chat.chat_id, user_id },
        });
        if (participant) {
          chat.unread_count = participant.unread_count;
        }
      }
      return sortedChats;
    } catch (error) {
      this.logger?.error?.(`Error getting chats: ${error.message}`);
      throw new RpcException('Failed to get chats');
    }
  }

  async isParticipant({
    chat_id,
    user_id,
    client_id,
  }: {
    chat_id: string;
    user_id: number;
    client_id: number;
  }): Promise<boolean> {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) return false;
      const participant = await this.prisma.chatParticipant.findUnique({
        where: { chat_id_user_id: { chat_id, user_id } },
      });
      return !!participant;
    } catch (error) {
      this.logger.error(`Error checking participant: ${error.message}`);
      throw new RpcException('Failed to check participant');
    }
  }

  async leaveChat({
    chat_id,
    user_id,
    client_id,
  }: {
    chat_id: string;
    user_id: number;
    client_id: number;
  }) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) throw new RpcException('Chat not found');
      await this.prisma.chatParticipant.deleteMany({
        where: { chat_id, user_id },
      });
    } catch (error) {
      this.logger.error(`Error leaving chat: ${error.message}`);
      throw new RpcException('Failed to leave chat');
    }
  }

  async sendMessage(data: {
    chat_id: string;
    sender_id: number;
    content: string;
    client_id: number;
  }) {
    try {
      const { chat_id, sender_id, content, client_id } = data;
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) throw new RpcException('Chat not found');
      const message = await this.prisma.message.create({
        data: {
          chat_id,
          sender_id,
          content,
          status: 'SENT',
          client_id: client_id,
        },
      });
      await this.prisma.chatParticipant.updateMany({
        where: { chat_id, user_id: { not: sender_id } },
        data: { unread_count: { increment: 1 } },
      });
      return message;
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw new RpcException('Failed to send message');
    }
  }

  async createAndSendMessage({
    sender_id,
    content,
    participant_id,
    client_id,
  }: {
    sender_id: number;
    content: string;
    participant_id: number;
    client_id: number;
  }) {
    try {
      let chat = await this.prisma.chat.findFirst({
        where: {
          client_id,
          participants: { some: { user_id: sender_id } },
          AND: { participants: { some: { user_id: participant_id } } },
        },
      });
      if (!chat) {
        chat = await this.prisma.chat.create({
          data: {
            client_id,
            participants: {
              create: [
                { user_id: sender_id, client_id },
                { user_id: participant_id, client_id },
              ],
            },
          },
        });
      }
      const result = await this.prisma.$transaction(async (prisma) => {
        const message = await prisma.message.create({
          data: {
            chat_id: chat.chat_id,
            sender_id,
            content,
            status: 'SENT',
            client_id: client_id,
          },
        });
        await prisma.chatParticipant.updateMany({
          where: { chat_id: chat.chat_id, user_id: { not: sender_id } },
          data: { unread_count: { increment: 1 } },
        });
        return message;
      });
      return result;
    } catch (error) {
      this.logger.error(`Error creating and sending message: ${error.message}`);
      throw new RpcException('Failed to create and send message');
    }
  }

  async markMessagesAsRead({
    chat_id,
    user_id,
    client_id,
  }: {
    chat_id: string;
    user_id: number;
    client_id: number;
  }) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) throw new RpcException('Chat not found');
      const messages = await this.prisma.message.findMany({
        where: {
          chat_id,
          sender_id: { not: user_id },
          status: { in: ['SENT', 'DELIVERED'] },
        },
        select: { message_id: true, sender_id: true },
      });
      if (messages.length === 0) return [];
      await this.prisma.message.updateMany({
        where: { message_id: { in: messages.map((m) => m.message_id) } },
        data: { status: 'READ' },
      });
      return messages.map((m) => ({
        message_id: m.message_id,
        sender_id: m.sender_id,
      }));
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      throw new RpcException('Failed to mark messages as read');
    }
  }

  async createDirectChat({
    creator_id,
    participant_id,
    client_id,
  }: {
    creator_id: number;
    participant_id: number;
    client_id: number;
  }) {
    try {
      if (!participant_id || !creator_id)
        throw new RpcException('Chat create constraints not met');
      const existingChat = await this.prisma.chat.findFirst({
        where: {
          client_id,
          participants: {
            every: { user_id: { in: [creator_id, participant_id] } },
          },
        },
        include: { participants: true },
      });
      if (existingChat) return existingChat;
      const newChat = await this.prisma.chat.create({
        data: { client_id },
        select: { chat_id: true },
      });
      await this.prisma.chatParticipant.upsert({
        where: {
          chat_id_user_id: { chat_id: newChat.chat_id, user_id: creator_id },
        },
        update: { is_admin: true },
        create: {
          chat_id: newChat.chat_id,
          user_id: creator_id,
          is_admin: true,
          client_id,
        },
      });
      await this.prisma.chatParticipant.upsert({
        where: {
          chat_id_user_id: {
            chat_id: newChat.chat_id,
            user_id: participant_id,
          },
        },
        update: { is_admin: false },
        create: {
          chat_id: newChat.chat_id,
          user_id: participant_id,
          is_admin: false,
          client_id,
        },
      });
      const chat = await this.prisma.chat.findFirst({
        where: { chat_id: newChat.chat_id },
        include: { participants: true },
      });
      return chat!;
    } catch (error) {
      this.logger.error(`Error creating direct chat: ${error.message}`);
      throw new RpcException('Failed to create direct chat');
    }
  }

  async getParticipants({
    chat_id,
    client_id,
  }: {
    chat_id: string;
    client_id: number;
  }) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) throw new RpcException('Chat not found');
      const participants = await this.prisma.chatParticipant.findMany({
        where: { chat_id },
      });
      if (participants.length > 0) {
        for (const participant of participants as any) {
          if (participant.user_id) {
            const user = await this.userService.getUserDetails({
              userId: participant.user_id,
              clientId: client_id,
            });
            participant.user = user.data;
          }
        }
      }
      return participants;
    } catch (error) {
      this.logger.error(`Error getting participants: ${error.message}`);
      throw new RpcException('Failed to get participants');
    }
  }

  async updateMessageStatus({
    recipient_id,
    from_status,
    to_status,
    client_id,
  }: {
    recipient_id: number;
    from_status: string;
    to_status: string;
    client_id: number;
  }) {
    try {
      const chats = await this.prisma.chat.findMany({
        where: { client_id, participants: { some: { user_id: recipient_id } } },
        select: { chat_id: true },
      });
      const chatIds = chats.map((c) => c.chat_id);
      const messages = await this.prisma.message.findMany({
        where: {
          chat_id: { in: chatIds },
          sender_id: { not: recipient_id },
          status: MessageStatus[from_status],
          client_id,
        },
        select: { message_id: true, chat_id: true, sender_id: true },
      });
      if (messages.length > 0) {
        await this.prisma.message.updateMany({
          where: { message_id: { in: messages.map((m) => m.message_id) } },
          data: { status: MessageStatus[to_status] },
        });
      }
      return messages;
    } catch (error) {
      this.logger.error(`Error updating message status: ${error.message}`);
      throw new RpcException('Failed to update message status');
    }
  }

  async updateStatus({
    message_id,
    to_status,
  }: {
    message_id: string;
    to_status: string;
  }) {
    try {
      const message = await this.prisma.message.update({
        where: { message_id },
        data: { status: MessageStatus[to_status] },
      });
      return message;
    } catch (error) {
      this.logger.error(`Error updating message status: ${error.message}`);
      throw new RpcException('Failed to update message status');
    }
  }

  async createChat({
    creator_id,
    participant_ids,
    client_id,
  }: {
    creator_id: number;
    participant_ids: number[];
    client_id: number;
  }) {
    try {
      const creator = await this.userService.getUserDetails({
        userId: creator_id,
        clientId: client_id,
      });

      if (!participant_ids.includes(creator_id)) {
        participant_ids.push(creator_id);
      }
      const uniqueParticipantIds = [...new Set(participant_ids)];
      const newChat = await this.prisma.chat.create({
        data: {
          client_id: client_id,
          participants: {
            create: uniqueParticipantIds.map((user_id) => ({
              user_id,
              client_id,
            })),
          },
        },
        include: { participants: true },
      });
      const creatorName = creator?.data?.username || 'Unknown user';
      await this.prisma.message.create({
        data: {
          chat_id: newChat.chat_id,
          sender_id: creator_id,
          content: `Chat created by ${creatorName}`,
          type: 'SYSTEM',
          status: MessageStatus.DELIVERED,
          client_id: client_id,
        },
      });
      this.logger.log(
        `Created chat ${newChat.chat_id} with ${newChat.participants.length} participants`,
      );
      return newChat;
    } catch (error) {
      this.logger.error(`Error creating chat: ${error.message}`);
      throw new RpcException(`Failed to create chat: ${error.message}`);
    }
  }

  async getChatMessages({
    chat_id,
    client_id,
  }: {
    chat_id: string;
    client_id: number;
  }) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) throw new RpcException('Chat not found');
      const messages = await this.prisma.message.findMany({
        where: { chat_id },
        orderBy: { created_at: 'asc' },
      });
      if (messages.length > 0) {
        for (const message of messages as any) {
          if (message.sender_id) {
            const user = await this.userService.getUserDetails({
              userId: message.sender_id,
              clientId: client_id,
            });
            message.sender = user?.data;
          }
        }
      }
      return messages;
    } catch (error) {
      this.logger.error(`Error getting chat messages: ${error.message}`);
      throw new RpcException('Failed to get chat messages');
    }
  }

  async getLastMessage({
    chat_id,
    client_id,
  }: {
    chat_id: string;
    client_id: number;
  }) {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { chat_id, client_id },
      });
      if (!chat) throw new RpcException('Chat not found');
      const message = await this.prisma.message.findFirst({
        where: { chat_id },
        orderBy: { created_at: 'desc' },
      });
      if (message && (message as any).sender_id) {
        const user = await this.userService.getUserDetails({
          userId: (message as any).sender_id,
          clientId: client_id,
        });
        (message as any).sender = user?.data;
      }
      return message;
    } catch (error) {
      this.logger.error(`Error getting last message: ${error.message}`);
      throw new RpcException(`Failed to get last message: ${error.message}`);
    }
  }

  async getLastMessagesForChats(chat_ids: string[], client_id: number) {
    try {
      const lastMessages = await Promise.all(
        chat_ids.map(async (chat_id) => {
          const message = await this.getLastMessage({ chat_id, client_id });
          return { chat_id, message };
        }),
      );
      return lastMessages.reduce((acc, { chat_id, message }) => {
        acc[chat_id] = message;
        return acc;
      }, {});
    } catch (error) {
      this.logger.error(`Error getting last messages: ${error.message}`);
      throw new RpcException(`Failed to get last messages: ${error.message}`);
    }
  }
}
