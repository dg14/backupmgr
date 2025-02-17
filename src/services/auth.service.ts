import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/user/user';
import { Repository } from 'typeorm';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private cryptoService: CryptoService,
  ) {}
  findByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOneBy({ login: login });
  }

  getHello(): string {
    return 'Hello World!';
  }
  async validateLogin(body: any, session: Record<string, any>) {
    let u = await this.findByLogin(body.login);
    if (u && this.cryptoService.genHash(body.password) == u.password) {
      return {
        success: true,
        uid: u.id,
        level: u.level,
      };
    } else {
      return {
        success: false,
      };
    }
  }
}
