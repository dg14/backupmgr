import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AppService {
  getNotificationsActive(): boolean {
    return process.env.NOTIFICATIONS_ACTIVE == 'true';
  }

  getHello(): string {
    return 'Hello World!';
  }
  getDocRoot(): string {
    return process.env.SUFFIX_URL ?? '';
  }
  getUserLevel(req: Request) {
    return req.session['level'] || null;
  }
}
