/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  ChatIdRequest,
  ChatParticipantRequest,
  ClientIdRequest,
  CreateAndSendMessageRequest,
  CreateChatRequest,
  CreateDirectChatRequest,
  CreateMessageRequest,
  FindOneMessage,
  GetChatsRequest,
  GetLastMessagesRequest,
  GetUserNotificationsRequest,
  NOTIFICATION_SERVICE_NAME,
  SendChatMessageRequest,
  UpdateMessageStatusRequest,
  UpdateStatusRequest,
} from 'src/proto/noti.pb';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'createMessage')
  createMessage(payload: CreateMessageRequest) {
    return this.messageService.createMessage(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'findOneMessage')
  findOneMessage(payload: FindOneMessage) {
    return this.messageService.findOneMessage(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'findAllMessages')
  findAllMessages(payload: ClientIdRequest) {
    return this.messageService.findAllMessages(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'findUserMessages')
  findUserMessages(payload: GetUserNotificationsRequest) {
    return this.messageService.findUserMessages(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'updateMessage')
  updateMessage(payload: CreateMessageRequest) {
    return this.messageService.updateMessage(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'deleteMessage')
  deleteMessage(payload: FindOneMessage) {
    return this.messageService.deleteMessage(payload);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetChatHistory')
  getChatHistory(payload: ChatIdRequest) {
    return this.messageService.getChatHistory({
      chat_id: payload.chatId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetMessages')
  getMessages(payload: ChatIdRequest) {
    return this.messageService.getMessages({
      chat_id: payload.chatId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetChats')
  getChats(payload: GetChatsRequest) {
    return this.messageService.getChats({
      user_id: payload.userId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'IsParticipant')
  isParticipant(payload: ChatParticipantRequest) {
    return this.messageService.isParticipant({
      chat_id: payload.chatId,
      user_id: payload.userId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'LeaveChat')
  leaveChat(payload: ChatParticipantRequest) {
    return this.messageService.leaveChat({
      chat_id: payload.chatId,
      user_id: payload.userId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendChatMessage')
  sendChatMessage(payload: SendChatMessageRequest) {
    return this.messageService.sendMessage({
      chat_id: payload.chatId,
      sender_id: payload.senderId,
      content: payload.content,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'CreateAndSendMessage')
  createAndSendMessage(payload: CreateAndSendMessageRequest) {
    return this.messageService.createAndSendMessage({
      sender_id: payload.senderId,
      content: payload.content,
      participant_id: payload.participantId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'MarkMessagesAsRead')
  markMessagesAsRead(payload: ChatParticipantRequest) {
    return this.messageService.markMessagesAsRead({
      chat_id: payload.chatId,
      user_id: payload.userId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'CreateDirectChat')
  createDirectChat(payload: CreateDirectChatRequest) {
    return this.messageService.createDirectChat({
      creator_id: payload.creatorId,
      participant_id: payload.participantId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetParticipants')
  getParticipants(payload: ChatIdRequest) {
    return this.messageService.getParticipants({
      chat_id: payload.chatId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'UpdateMessageStatus')
  updateMessageStatus(payload: UpdateMessageStatusRequest) {
    return this.messageService.updateMessageStatus({
      recipient_id: payload.recipientId,
      from_status: payload.fromStatus,
      to_status: payload.toStatus,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'UpdateStatus')
  updateStatus(payload: UpdateStatusRequest) {
    return this.messageService.updateStatus({
      message_id: payload.messageId,
      to_status: payload.toStatus,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'CreateChat')
  createChat(payload: CreateChatRequest) {
    return this.messageService.createChat({
      creator_id: payload.creatorId,
      participant_ids: payload.participantIds,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetChatMessages')
  getChatMessages(payload: ChatIdRequest) {
    return this.messageService.getChatMessages({
      chat_id: payload.chatId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetLastMessage')
  getLastMessage(payload: ChatIdRequest) {
    return this.messageService.getLastMessage({
      chat_id: payload.chatId,
      client_id: payload.clientId,
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetLastMessagesForChats')
  getLastMessagesForChats(payload: GetLastMessagesRequest) {
    return this.messageService.getLastMessagesForChats(
      payload.chatIds,
      payload.clientId,
    );
  }
}
