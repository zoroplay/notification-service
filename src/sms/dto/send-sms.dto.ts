/* eslint-disable prettier/prettier */
export class SendSMSDTO {
  mode: 'mtech'| 'yournotify';
  msisdn!: string;
  text!: string;
  sender_id!: string;
  name!: string;
  from!: string;
  status!: string;
  list!: any;
  schedule!: string;
  channel!: string;
}
