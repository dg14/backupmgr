import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/models/user/user';
import { Jobinstance } from '../models/jobinstance/jobinstance';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}
  async testNotification(user: User): Promise<void> {
    if (user.email != '') {
      await this.mailerService.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Email test from BackupMgr',
        text: 'Email test from backupmgr',
      });
      this.logger.log(
        `Test email from:${process.env.EMAIL_FROM}  to ${user.email}`,
      );
    }
  }
  async sendJobNotification(
    user: User,
    jobinstance: Jobinstance,
  ): Promise<void> {
    try {
      if (
        user.email != '' &&
        user.notifications &&
        jobinstance.job.notifications
      ) {
        this.logger.log(
          `Job log email from:${process.env.EMAIL_FROM}  to ${user.email}`,
        );
        await this.mailerService.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject:
            (process.env.EMAIL_JOB_PREFIX_SUBJECT
              ? process.env.EMAIL_JOB_PREFIX_SUBJECT + ' '
              : '') +
            '[' +
            jobinstance.job.name +
            '] status ' +
            jobinstance.status,
          text:
            'Job started at ' +
            jobinstance.start +
            ' is exited with exit status:' +
            jobinstance.exit +
            ' at ' +
            jobinstance.end +
            ' with log:\n\n' +
            jobinstance.log,
        });
        this.logger.log(
          `Job notification email from:${process.env.EMAIL_FROM}  to ${user.email} for jobinstance: ${jobinstance.id} of job: ${jobinstance.job.name}/${jobinstance.job.id}`,
        );
      }
    } catch (e) {
      this.logger.error(e.message, e.stack);
    }
  }
}
