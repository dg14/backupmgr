import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/user/user';
import { Repository } from 'typeorm';
import { CryptoService } from './crypto.service';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);
  private levels = [
    {
      id: 1,
      name: 'Admin',
    },
    { id: 2, name: 'User' },
  ];
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

  async save(body: any): Promise<User> {
    let u: User;
    if (body.id) {
      // utente gia esistente
      u = await this.userRepository.findOneBy({ id: parseInt(body.id) });
      if (!u) throw new Error('Not found:' + body.id);
    } else {
      u = new User();
      u.login = body.login;
      u.createdAt = new Date();
      u.updatedAt = new Date();
    }

    if (
      body.pwd1string &&
      body.pwd1string != '' &&
      body.pwd2string &&
      body.pwd2string != '' &&
      body.pwd1string == body.pwd2string &&
      this.checkPasswordComplexity(body.pwd1string)
    ) {
      u.password = this.cryptoService.genHash(body.pwd1string);
    } else {
      throw Error('Password error');
    }
    if (body.active && body.active == 'on') {
      u.active = true;
    } else {
      u.active = false;
    }
    if (body.notifications && body.notifications == 'on') {
      u.notifications = true;
    } else {
      u.notifications = false;
    }
    if (body.level) {
      u.level = body.level;
    }
    u.email = body.email;
    let u1 = await this.userRepository.save(u);
    return u1;
  }
  checkPasswordComplexity(pwd1string: any): boolean {
    if (!pwd1string) return false;
    if (pwd1string.length < 8) return false;
    return true;
  }
  async findOne(id: number) {
    let u = await this.userRepository.findOneBy({ id: id });
    u.password = null;
    return u;
  }
  async findAll(): Promise<any[]> {
    let list = await this.userRepository.find();
    let ret = [];
    for (let u of list) {
      u.password = null;
      ret.push({
        id: u.id,
        login: u.login,
        level: this.levels.find((element) => element.id == u.level).name,
        active: u.active,
        updatedAt: u.updatedAt,
        createdAt: u.createdAt,
        notifications: u.notifications,
      });
    }
    return ret;
  }

  async saveProfile(id: number, body: any) {
    let u = await this.userRepository.findOneBy({ id: id });
    if (!u) throw new Error('Not found:' + body.id);
    if (
      body.pwd1string &&
      body.pwd1string != '' &&
      body.pwd2string &&
      body.pwd2string != '' &&
      body.pwd1string == body.pwd2string &&
      this.checkPasswordComplexity(body.pwd1string)
    ) {
      u.password = this.cryptoService.genHash(body.pwd1string);
    }
    if (body.notifications && body.notifications == 'on') {
      u.notifications = true;
    } else {
      u.notifications = false;
    }

    let u1 = await this.userRepository.save(u);
    return u1;
  }
}
