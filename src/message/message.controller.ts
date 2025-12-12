/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  ClientIdRequest,
  CreateMessageRequest,
  FindOneMessage,
  GetUserNotificationsRequest,
  NOTIFICATION_SERVICE_NAME
} from 'src/proto/noti.pb';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

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

}

