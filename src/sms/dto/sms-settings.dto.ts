/* eslint-disable prettier/prettier */
export class SaveSettingsDTO {
    settings_id!: string;
    enable: boolean;
    display_name: string;
    gateway_name: string;
    sender_id: string;
    api_key: string;
    username: string;
    password: string;
    status: 0 | 1
}
  