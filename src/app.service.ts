import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getDocRoot(): string {
    return process.env.SUFFIX_URL ?? '';
  }
}
