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
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/authguard.service';
import { UserService } from 'src/services/user.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private appService: AppService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('user_list')
  async getallUsers() {
    return {
      users: await this.userService.findAll(),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Get('new')
  @UseGuards(AuthGuard)
  @Render('user_form')
  async createUser() {
    return {
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
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Post('save')
  @UseGuards(AuthGuard)
  async save(@Req() req: Request, @Res() res: Response) {
    let j = await this.userService.save(req.body);
    res.redirect(302, `${this.appService.getDocRoot()}/users/details/${j.id}`);
  }
}
