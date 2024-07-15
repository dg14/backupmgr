import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/authguard.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('index')
  root(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return {
      message: 'Hello world!',
      DOCROOT: process.env.SUFFIX_URL,
      level: this.appService.getUserLevel(req),
    };
  }

  @Get('login')
  @Render('login')
  loginView(@Res() res: Response, @Session() session: Record<string, any>) {
    return { message: 'Hello world!', DOCROOT: process.env.SUFFIX_URL };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session['logged'] = false;
    req.session.destroy(() => {});
    res.redirect(302, '/');
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
    @Body() body,
  ): Promise<void> {
    let ret = await this.authService.validateLogin(body, session);
    if (ret.success) {
      session['uid'] = ret.uid;
      session['level'] = ret.level;
      session['logged'] = true;
      res.redirect(302, '/');
    } else {
      res.redirect(302, '/login');
    }
  }
}
