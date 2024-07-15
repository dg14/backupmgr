import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from '../app.service';
import { AuthGuard } from '../services/authguard.service';
import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private appService: AppService,
    private emailService: EmailService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('user_list')
  async getallUsers(@Req() req: Request) {
    return {
      level: this.appService.getUserLevel(req),
      users: await this.userService.findAll(),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Get('new')
  @UseGuards(AuthGuard)
  @Render('user_form')
  async createUser(@Req() req: Request) {
    return {
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Get('details/:id')
  @UseGuards(AuthGuard)
  @Render('user_form')
  async modifyUser(@Req() req: Request) {
    let j = await this.userService.findOne(parseInt(req.params['id']));
    return {
      user: j,
      me: parseInt(req.session['uid']),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Post('save')
  @UseGuards(AuthGuard)
  async save(@Req() req: Request, @Res() res: Response) {
    let j = await this.userService.save(req.body);
    res.redirect(302, `${this.appService.getDocRoot()}/users/details/${j.id}`);
  }

  @Get('testnotif/:id')
  @UseGuards(AuthGuard)
  async restart(@Req() req: Request) {
    let u = await this.userService.findOne(parseInt(req.params['id']));
    await this.emailService.testNotification(u);    
    return {
      success: true,
    };
  }
}
