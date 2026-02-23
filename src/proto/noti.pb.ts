/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { wrappers } from "protobufjs";
import { Observable } from "rxjs";
import { Struct } from "./google/protobuf/struct.pb";

export const protobufPackage = "notification";

/** Menu */
export interface CreateMessageRequest {
  title: string;
  clientId: number;
  content: string;
  status: boolean;
  id?: number | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface FindOneMessage {
  clientId: number;
  id: number;
}

export interface ClientIdRequest {
  clientId: number;
}

export interface CommonResponseObj {
  status?: number | undefined;
  success?: boolean | undefined;
  message: string;
  data?: { [key: string]: any } | undefined;
  errors?: string | undefined;
}

export interface SendMessageRequest {
  clientId: number;
  messageId: number;
  userId: string;
}

export interface HandleNotificationsRequest {
  userId: number;
  description: string;
  title: string;
}

export interface GetUserNotificationsRequest {
  userId: number;
}

export interface SetReadNotificationsRequest {
  id: number;
}

export interface HandleNotificationsResponse {
  message: string;
  status: boolean;
  data?: Notifications | undefined;
}

export interface SetReadNotificationsResponse {
  message: string;
  status: boolean;
  data: Notifications | undefined;
}

export interface GetUserNotificationsResponse {
  message: string;
  status: boolean;
  data: Notifications[];
}

export interface Notifications {
  userId: number;
  description: string;
  title: string;
  status: number;
  createdAt: string;
  id: number;
}

export interface SaveSettingsRequest {
  settingsID?: number | undefined;
  clientId: number;
  enable: boolean;
  displayName: string;
  gatewayName: string;
  senderID: string;
  apiKey?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
}

export interface SaveSettingsResponse {
  message: string;
  status: boolean;
}

export interface GetSettingsRequest {
  clientId: number;
}

export interface GetSettingsResponse {
  message: string;
  status: boolean;
  data: SettingData[];
}

export interface SettingData {
  id: number;
  status: boolean;
  displayName: string;
  gatewayName: string;
  senderID: string;
  apiKey: string;
  username: string;
  password: string;
}

export interface SendSmsRequest {
  msisdn: string;
  text: string;
  senderID: string;
  name: string;
  from: string;
  status: string;
  phoneNumbers: string[];
  schedule: string;
  channel: string;
  mode: string;
  campaignType: string;
  clientID: number;
  operator: string;
}

export interface SendOtpRequest {
  clientID: number;
  phoneNumber: string;
  operator: string;
  countryCode?: string | undefined;
}

export interface VerifyOtpRequest {
  clientID: number;
  phoneNumber: string;
  code: string;
}

export interface SendSmsResponse {
  message: string;
  status: boolean;
}

export interface DeliveryReportRequest {
  username: string;
  password: string;
  messageId: string;
}

export interface DeliveryReportResponse {
  status: string;
  timeSubmitted: string;
  timeDelivered: string;
  message: string;
  sender: string;
  messageId: string;
}

/** Shared: any operation that only needs a chat + client scope */
export interface ChatIdRequest {
  chatId: string;
  clientId: number;
}

/** GetChats */
export interface GetChatsRequest {
  userId: number;
  clientId: number;
}

/** IsParticipant / LeaveChat / MarkMessagesAsRead */
export interface ChatParticipantRequest {
  chatId: string;
  userId: number;
  clientId: number;
}

/** IsParticipant response (distinct because it carries a boolean) */
export interface IsParticipantResponse {
  status: number;
  isParticipant: boolean;
  message: string;
}

/** SendChatMessage */
export interface SendChatMessageRequest {
  chatId: string;
  senderId: number;
  content: string;
  clientId: number;
}

/** CreateAndSendMessage */
export interface CreateAndSendMessageRequest {
  senderId: number;
  content: string;
  participantId: number;
  clientId: number;
}

/** CreateDirectChat */
export interface CreateDirectChatRequest {
  creatorId: number;
  participantId: number;
  clientId: number;
}

/** UpdateMessageStatus (bulk status transition by recipient) */
export interface UpdateMessageStatusRequest {
  recipientId: number;
  fromStatus: string;
  toStatus: string;
  clientId: number;
}

/** UpdateStatus (single message) */
export interface UpdateStatusRequest {
  messageId: string;
  toStatus: string;
}

/** CreateChat (group) */
export interface CreateChatRequest {
  creatorId: number;
  participantIds: number[];
  clientId: number;
}

/** GetLastMessagesForChats */
export interface GetLastMessagesRequest {
  chatIds: string[];
  clientId: number;
}

/** SavePushSubscription */
export interface SavePushSubscriptionRequest {
  userId: number;
  clientId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  /** WEB | ANDROID | IOS  (default: WEB) */
  platform: string;
}

/** SendNotificationToUser */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  data: { [key: string]: string };
}

export interface PushNotificationPayload_DataEntry {
  key: string;
  value: string;
}

export interface SendNotificationToUserRequest {
  userId: number;
  clientId: number;
  notification: PushNotificationPayload | undefined;
}

export interface SendNotificationToUserResponse {
  success: boolean;
  message: string;
  successful: number;
  failed: number;
  notificationId?: number | undefined;
}

export const NOTIFICATION_PACKAGE_NAME = "notification";

wrappers[".google.protobuf.Struct"] = { fromObject: Struct.wrap, toObject: Struct.unwrap } as any;

export interface NotificationServiceClient {
  setReadNotifications(request: SetReadNotificationsRequest): Observable<SetReadNotificationsResponse>;

  getUserNotifications(request: GetUserNotificationsRequest): Observable<GetUserNotificationsResponse>;

  handleNotifications(request: HandleNotificationsRequest): Observable<HandleNotificationsResponse>;

  saveSettings(request: SaveSettingsRequest): Observable<SaveSettingsResponse>;

  getSettings(request: GetSettingsRequest): Observable<GetSettingsResponse>;

  sendSms(request: SendSmsRequest): Observable<SendSmsResponse>;

  sendOtp(request: SendOtpRequest): Observable<SendSmsResponse>;

  verifyOtp(request: VerifyOtpRequest): Observable<SendSmsResponse>;

  getDeliveryReport(request: DeliveryReportRequest): Observable<DeliveryReportResponse>;

  findOneMessage(request: FindOneMessage): Observable<CommonResponseObj>;

  findAllMessages(request: ClientIdRequest): Observable<CommonResponseObj>;

  updateMessage(request: CreateMessageRequest): Observable<CommonResponseObj>;

  deleteMessage(request: FindOneMessage): Observable<CommonResponseObj>;

  createMessage(request: CreateMessageRequest): Observable<CommonResponseObj>;

  sendMessage(request: SendMessageRequest): Observable<CommonResponseObj>;

  findUserMessages(request: GetUserNotificationsRequest): Observable<CommonResponseObj>;

  updateUserMessage(request: FindOneMessage): Observable<CommonResponseObj>;

  deleteUserMessage(request: FindOneMessage): Observable<CommonResponseObj>;

  /** Chat RPCs */

  getChatHistory(request: ChatIdRequest): Observable<CommonResponseObj>;

  getMessages(request: ChatIdRequest): Observable<CommonResponseObj>;

  getChats(request: GetChatsRequest): Observable<CommonResponseObj>;

  isParticipant(request: ChatParticipantRequest): Observable<IsParticipantResponse>;

  leaveChat(request: ChatParticipantRequest): Observable<CommonResponseObj>;

  sendChatMessage(request: SendChatMessageRequest): Observable<CommonResponseObj>;

  createAndSendMessage(request: CreateAndSendMessageRequest): Observable<CommonResponseObj>;

  markMessagesAsRead(request: ChatParticipantRequest): Observable<CommonResponseObj>;

  createDirectChat(request: CreateDirectChatRequest): Observable<CommonResponseObj>;

  getParticipants(request: ChatIdRequest): Observable<CommonResponseObj>;

  updateMessageStatus(request: UpdateMessageStatusRequest): Observable<CommonResponseObj>;

  updateStatus(request: UpdateStatusRequest): Observable<CommonResponseObj>;

  createChat(request: CreateChatRequest): Observable<CommonResponseObj>;

  getChatMessages(request: ChatIdRequest): Observable<CommonResponseObj>;

  getLastMessage(request: ChatIdRequest): Observable<CommonResponseObj>;

  getLastMessagesForChats(request: GetLastMessagesRequest): Observable<CommonResponseObj>;

  /** Push notification RPCs */

  savePushSubscription(request: SavePushSubscriptionRequest): Observable<CommonResponseObj>;

  sendNotificationToUser(request: SendNotificationToUserRequest): Observable<SendNotificationToUserResponse>;
}

export interface NotificationServiceController {
  setReadNotifications(
    request: SetReadNotificationsRequest,
  ): Promise<SetReadNotificationsResponse> | Observable<SetReadNotificationsResponse> | SetReadNotificationsResponse;

  getUserNotifications(
    request: GetUserNotificationsRequest,
  ): Promise<GetUserNotificationsResponse> | Observable<GetUserNotificationsResponse> | GetUserNotificationsResponse;

  handleNotifications(
    request: HandleNotificationsRequest,
  ): Promise<HandleNotificationsResponse> | Observable<HandleNotificationsResponse> | HandleNotificationsResponse;

  saveSettings(
    request: SaveSettingsRequest,
  ): Promise<SaveSettingsResponse> | Observable<SaveSettingsResponse> | SaveSettingsResponse;

  getSettings(
    request: GetSettingsRequest,
  ): Promise<GetSettingsResponse> | Observable<GetSettingsResponse> | GetSettingsResponse;

  sendSms(request: SendSmsRequest): Promise<SendSmsResponse> | Observable<SendSmsResponse> | SendSmsResponse;

  sendOtp(request: SendOtpRequest): Promise<SendSmsResponse> | Observable<SendSmsResponse> | SendSmsResponse;

  verifyOtp(request: VerifyOtpRequest): Promise<SendSmsResponse> | Observable<SendSmsResponse> | SendSmsResponse;

  getDeliveryReport(
    request: DeliveryReportRequest,
  ): Promise<DeliveryReportResponse> | Observable<DeliveryReportResponse> | DeliveryReportResponse;

  findOneMessage(
    request: FindOneMessage,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  findAllMessages(
    request: ClientIdRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  updateMessage(
    request: CreateMessageRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  deleteMessage(
    request: FindOneMessage,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  createMessage(
    request: CreateMessageRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  sendMessage(
    request: SendMessageRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  findUserMessages(
    request: GetUserNotificationsRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  updateUserMessage(
    request: FindOneMessage,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  deleteUserMessage(
    request: FindOneMessage,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  /** Chat RPCs */

  getChatHistory(
    request: ChatIdRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  getMessages(request: ChatIdRequest): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  getChats(request: GetChatsRequest): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  isParticipant(
    request: ChatParticipantRequest,
  ): Promise<IsParticipantResponse> | Observable<IsParticipantResponse> | IsParticipantResponse;

  leaveChat(
    request: ChatParticipantRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  sendChatMessage(
    request: SendChatMessageRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  createAndSendMessage(
    request: CreateAndSendMessageRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  markMessagesAsRead(
    request: ChatParticipantRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  createDirectChat(
    request: CreateDirectChatRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  getParticipants(
    request: ChatIdRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  updateMessageStatus(
    request: UpdateMessageStatusRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  updateStatus(
    request: UpdateStatusRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  createChat(
    request: CreateChatRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  getChatMessages(
    request: ChatIdRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  getLastMessage(
    request: ChatIdRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  getLastMessagesForChats(
    request: GetLastMessagesRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  /** Push notification RPCs */

  savePushSubscription(
    request: SavePushSubscriptionRequest,
  ): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

  sendNotificationToUser(
    request: SendNotificationToUserRequest,
  ):
    | Promise<SendNotificationToUserResponse>
    | Observable<SendNotificationToUserResponse>
    | SendNotificationToUserResponse;
}

export function NotificationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "setReadNotifications",
      "getUserNotifications",
      "handleNotifications",
      "saveSettings",
      "getSettings",
      "sendSms",
      "sendOtp",
      "verifyOtp",
      "getDeliveryReport",
      "findOneMessage",
      "findAllMessages",
      "updateMessage",
      "deleteMessage",
      "createMessage",
      "sendMessage",
      "findUserMessages",
      "updateUserMessage",
      "deleteUserMessage",
      "getChatHistory",
      "getMessages",
      "getChats",
      "isParticipant",
      "leaveChat",
      "sendChatMessage",
      "createAndSendMessage",
      "markMessagesAsRead",
      "createDirectChat",
      "getParticipants",
      "updateMessageStatus",
      "updateStatus",
      "createChat",
      "getChatMessages",
      "getLastMessage",
      "getLastMessagesForChats",
      "savePushSubscription",
      "sendNotificationToUser",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("NotificationService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("NotificationService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const NOTIFICATION_SERVICE_NAME = "NotificationService";
