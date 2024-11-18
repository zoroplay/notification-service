/* eslint-disable prettier/prettier */
export class SendSMSDTO {
  msisdn!: string;
  text!: string;
  sender_id!: string;
  name!: string;
  from!: string;
  status!: string;
  lists: string[];
  schedule!: string;
  channel!: string;
  campaign_type!: string;
  clientId: number;
}

export interface MessageData {
  receiver: string;
  sender: string;
  message: string;
  status?: boolean;
  operator?: string;
}