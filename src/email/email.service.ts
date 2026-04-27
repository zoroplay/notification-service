import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import * as SendGrid from '@sendgrid/mail';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly fallbackApiKey =
    process.env.SENDGRID_API_KEY || 'SG.DEFAULT_FALLBACK_KEY';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Initializing SendGrid configuration...');

    const config = await this.prisma.email_Settings.findFirst({
      where: {
        gatewayName: 'sendgrid',
        status: true,
      },
    });

    const apiKey = config?.apiKey || this.fallbackApiKey;

    if (!config?.apiKey) {
      this.logger.warn(
        'SendGrid API key not found in DB, using fallback SENDGRID_API_KEY/default key',
      );
    }

    SendGrid.setApiKey(apiKey);

    this.logger.log('SendGrid initialized successfully');
  }

  async sendEmail(mail: MailDataRequired): Promise<void> {
    try {
      this.logger.log(`Sending email to ${mail.to as string}`);

      const response = await SendGrid.send(mail);

      this.logger.log(`Email sent successfully`, {
        to: mail.to,
        response,
      });
    } catch (error) {
      this.logger.error('Error while sending email', {
        error: error?.message,
        stack: error?.stack,
        payload: mail,
      });

      throw error;
    }
  }
}