import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user/user';
import { Repository } from 'typeorm';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService implements OnModuleInit {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private cryptoService: CryptoService,
  ) {}
  findByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOneBy({ login: login });
  }

  async onModuleInit() {
    let u = await this.findByLogin(process.env.ROOT_USER);
    if (!u) {
      this.logger.log(`Not found ${process.env.ROOT_USER}, creating`);
      u = this.userRepository.create({
        login: process.env.ROOT_USER,
        password: this.cryptoService.genHash(process.env.FIRST_ROOT_PASSWORD),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        level: 1,
      });
      this.userRepository.save(u);
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
  async validateLogin(body: any, session: Record<string, any>) {
    let u = await this.findByLogin(body.login);
    if (!u) {
      return {
        success: false,
      };
    } else {
      if (this.cryptoService.genHash(body.password) == u.password) {
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
}
