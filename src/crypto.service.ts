import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { promisify } from 'util';

import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  scrypt,
} from 'node:crypto';

@Injectable()
export class CryptoService {
  async encryptData(data: string): Promise<string> {
    let s = process.env.CRYPTO_SECRET.split(':');
    let secret_key = s[0];
    let secret_iv = s[1];

    const key = (await promisify(scrypt)(secret_key, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, secret_iv);

    return Buffer.concat([cipher.update(data), cipher.final()]).toString(
      'base64',
    );
  }

  async decryptData(encryptedData: string): Promise<string> {
    let s = process.env.CRYPTO_SECRET.split(':');
    let secret_key = s[0];
    let secret_iv = s[1];

    const decipher = createDecipheriv('aes-256-ctr', secret_key, secret_iv);
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]).toString();
  }
  genHash(data: string) {
    return pbkdf2Sync(
      data,
      process.env.CRYPTO_SEED,
      10000,
      32,
      'sha256',
    ).toString('hex');
  }
}
