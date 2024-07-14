import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  Request,
  Response,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './authguard.service';
import * as session from 'express-session';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('index')
  root(@Res() res: Response, @Session() session: Record<string, any>) {
    return { message: 'Hello world!', DOCROOT: process.env.SUFFIX_URL };
  }

  @Get('login')
  @Render('login')
  loginView(@Res() res: Response, @Session() session: Record<string, any>) {
    return { message: 'Hello world!', DOCROOT: process.env.SUFFIX_URL };
  }

  @Get('logout')
  logout(@Req() req, @Res() res) {
    req.session.logged = false;
    req.session.destroy();
    res.redirect(302, '/');
  }

  @Post('login')
  async login(
    @Req() req,
    @Res() res,
    @Session() session: Record<string, any>,
    @Body() body,
  ): Promise<void> {
    let ret = await this.authService.validateLogin(body, session);
    if (ret.success) {
      session.logged = true;
      res.redirect(302, '/');
    } else {
      res.redirect(302, '/login');
    }
  }
}
