import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JobController } from './controllers/job.controller';
import { JobinstanceController } from './controllers/jobinstance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Job } from './models/job/job';
import { Jobinstance } from './models/jobinstance/jobinstance';
import { User } from './models/user/user';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { JobService } from './services/job.service';
import { JobmanagerService } from './jobmanager.service';
import { JSQLHelper } from './models/helpers/jsqlhelper';
import { MailerModule } from '@nestjs-modules/mailer';
import { RestoreController } from './controllers/restore.controller';
import { RestoreService } from './services/restore.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 1433,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [],
      synchronize: true,
      autoLoadEntities: true,

      options: { trustServerCertificate: true },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User, Job, Jobinstance]),
  ],
  controllers: [
    AppController,
    JobController,
    JobinstanceController,
    RestoreController,
  ],
  providers: [
    AppService,
    AuthService,
    CryptoService,
    JobService,
    JobmanagerService,
    JSQLHelper,
    RestoreService,
  ],
})
export class AppModule {}
