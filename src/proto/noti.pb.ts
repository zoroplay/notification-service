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
  segment: string;
  status: boolean;
  id?: number | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  imageUrl?: string | undefined;
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
  userId?: string | undefined;
  segment?: string | undefined;
  message?: string | undefined;
}

export interface HandleNotificationsRequest {
  userId: number;
  description: string;
  title: string;
  /** If non-empty, notifications are created for these user ids only. If empty, userId (field 1) is used as a single recipient. */
  userIds: number[];
}

export interface GetUserNotificationsRequest {
  userId: number;
  /** When true, returns all non-deleted notifications (read and unread). Default false = unread only. */
  includeRead?: boolean | undefined;
}

export interface SetReadNotificationsRequest {
  id: number;
  /** When set, the service verifies the notification belongs to this user before marking read. */
  userId?: number | undefined;
}

export interface DeleteAgentNotificationRequest {
  id: number;
  userId: number;
}

export interface DeleteAgentNotificationResponse {
  message: string;
  status: boolean;
}

export interface HandleNotificationsResponse {
  message: string;
  status: boolean;
  data?:
    | Notifications
    | undefined;
  /** All created notifications (same order as recipients). For one recipient, data matches dataList[0]. */
  dataList: Notifications[];
}

export interface NotifyCampaignAwardRequest {
  clientId: number;
  userId: number;
  phoneNumber: string;
  title: string;
  message: string;
  operator?: string | undefined;
}

export interface NotifyCampaignAwardResponse {
  message: string;
  status: boolean;
  inApp?: Notifications | undefined;
  smsSent: boolean;
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
  message?: string | undefined;
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

export interface CreateSmsProviderSettingRequest {
  clientId: number;
  displayName: string;
  gatewayName: string;
  senderID: string;
  apiKey?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
  enable: boolean;
}

export interface FindOneSmsProviderSettingRequest {
  id: number;
}

export interface FindAllSmsProviderSettingsRequest {
  clientId: number;
}

export interface UpdateSmsProviderSettingRequest {
  id: number;
  clientId?: number | undefined;
  displayName?: string | undefined;
  gatewayName?: string | undefined;
  senderID?: string | undefined;
  apiKey?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
  enable?: boolean | undefined;
}

export interface DeleteSmsProviderSettingRequest {
  id: number;
}

export interface SmsProviderSettingData {
  id: number;
  clientId: number;
  displayName: string;
  gatewayName: string;
  senderID: string;
  apiKey: string;
  username: string;
  password: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmsProviderSettingResponse {
  status?: number | undefined;
  success?: boolean | undefined;
  message: string;
  data?: SmsProviderSettingData | undefined;
}

export interface SmsProviderSettingsListResponse {
  status?: number | undefined;
  success?: boolean | undefined;
  message: string;
  data: SmsProviderSettingData[];
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

  /** In-app notification + SMS for CRM campaign/segment bonus awards (uses per-client SMS provider). */

  notifyCampaignAward(request: NotifyCampaignAwardRequest): Observable<NotifyCampaignAwardResponse>;

  deleteAgentNotification(request: DeleteAgentNotificationRequest): Observable<DeleteAgentNotificationResponse>;

  saveSettings(request: SaveSettingsRequest): Observable<SaveSettingsResponse>;

  getSettings(request: GetSettingsRequest): Observable<GetSettingsResponse>;

  sendSms(request: SendSmsRequest): Observable<SendSmsResponse>;

  sendOtp(request: SendOtpRequest): Observable<SendSmsResponse>;

  verifyOtp(request: VerifyOtpRequest): Observable<SendSmsResponse>;

  getDeliveryReport(request: DeliveryReportRequest): Observable<DeliveryReportResponse>;

  findMessage(request: FindOneMessage): Observable<CommonResponseObj>;

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

  /** SMS Provider Settings CRUD */

  createSmsProviderSetting(request: CreateSmsProviderSettingRequest): Observable<SmsProviderSettingResponse>;

  findOneSmsProviderSetting(request: FindOneSmsProviderSettingRequest): Observable<SmsProviderSettingResponse>;

  findAllSmsProviderSettings(request: FindAllSmsProviderSettingsRequest): Observable<SmsProviderSettingsListResponse>;

  updateSmsProviderSetting(request: UpdateSmsProviderSettingRequest): Observable<SmsProviderSettingResponse>;

  deleteSmsProviderSetting(request: DeleteSmsProviderSettingRequest): Observable<SmsProviderSettingResponse>;
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

  /** In-app notification + SMS for CRM campaign/segment bonus awards (uses per-client SMS provider). */

  notifyCampaignAward(
    request: NotifyCampaignAwardRequest,
  ): Promise<NotifyCampaignAwardResponse> | Observable<NotifyCampaignAwardResponse> | NotifyCampaignAwardResponse;

  deleteAgentNotification(
    request: DeleteAgentNotificationRequest,
  ):
    | Promise<DeleteAgentNotificationResponse>
    | Observable<DeleteAgentNotificationResponse>
    | DeleteAgentNotificationResponse;

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

  findMessage(request: FindOneMessage): Promise<CommonResponseObj> | Observable<CommonResponseObj> | CommonResponseObj;

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

  /** SMS Provider Settings CRUD */

  createSmsProviderSetting(
    request: CreateSmsProviderSettingRequest,
  ): Promise<SmsProviderSettingResponse> | Observable<SmsProviderSettingResponse> | SmsProviderSettingResponse;

  findOneSmsProviderSetting(
    request: FindOneSmsProviderSettingRequest,
  ): Promise<SmsProviderSettingResponse> | Observable<SmsProviderSettingResponse> | SmsProviderSettingResponse;

  findAllSmsProviderSettings(
    request: FindAllSmsProviderSettingsRequest,
  ):
    | Promise<SmsProviderSettingsListResponse>
    | Observable<SmsProviderSettingsListResponse>
    | SmsProviderSettingsListResponse;

  updateSmsProviderSetting(
    request: UpdateSmsProviderSettingRequest,
  ): Promise<SmsProviderSettingResponse> | Observable<SmsProviderSettingResponse> | SmsProviderSettingResponse;

  deleteSmsProviderSetting(
    request: DeleteSmsProviderSettingRequest,
  ): Promise<SmsProviderSettingResponse> | Observable<SmsProviderSettingResponse> | SmsProviderSettingResponse;
}

export function NotificationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "setReadNotifications",
      "getUserNotifications",
      "handleNotifications",
      "notifyCampaignAward",
      "deleteAgentNotification",
      "saveSettings",
      "getSettings",
      "sendSms",
      "sendOtp",
      "verifyOtp",
      "getDeliveryReport",
      "findMessage",
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
      "createSmsProviderSetting",
      "findOneSmsProviderSetting",
      "findAllSmsProviderSettings",
      "updateSmsProviderSetting",
      "deleteSmsProviderSetting",
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
