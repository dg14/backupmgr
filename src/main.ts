import { NestFactory } from '@nestjs/core';
import { Liquid } from 'liquidjs';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { config } from 'dotenv';
import * as winston from 'winston';

import 'winston-daily-rotate-file';
import { join } from 'path';
import * as session from 'express-session';

async function bootstrap() {
  config();

  const level = process.env.LOG_LEVEL || 'info';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.DailyRotateFile({
          level: level,
          filename: process.env.LOG_DIR + '/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '14d',
        }),
      ],
      exceptionHandlers: [
        new winston.transports.DailyRotateFile({
          level: level,
          filename: process.env.LOG_DIR + '/errors-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '14d',
        }),
      ],
      rejectionHandlers: [
        new winston.transports.DailyRotateFile({
          level: level,
          filename: process.env.LOG_DIR + '/errors-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '14d',
        }),
      ],
      handleExceptions: true,
      handleRejections: true,
      // options (same as WinstonModule.forRoot() options)
    }),
  });
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: process.env.SUFFIX_URL == '' ? '/' : process.env.SUFFIX_URL,
  });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  let engine = new Liquid({
    extname: '.liquid',
    root: join(__dirname, '..', 'templates'),
  });

  app.engine('liquid', engine.express());
  app.setViewEngine('liquid');
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: {
        secure: process.env.SESSION_SECURE == 'true',
        httpOnly: process.env.SESSION_SECURE == 'true',
        maxAge: 5184000000,
      },
    }),
  );
  if (process.env.SUFFIX_URL) app.setGlobalPrefix(process.env.SUFFIX_URL);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
