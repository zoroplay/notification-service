/* eslint-disable prettier/prettier */
export class SaveSettingsDTO {
    settingID!: number;
    clientID: number;
    enable: boolean;
    displayName: string;
    gatewayName: string;
    senderID: string;
    apiKey: string;
    username: string;
    password: string;
    status: boolean;
}
