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

@Controller('profile')
export class ProfileController {
  constructor(
    private userService: UserService,
    private appService: AppService,
  ) {}
  @Get()
  @UseGuards(AuthGuard)
  @Render('profile')
  async getallBacks() {
    return {
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Post('save')
  @UseGuards(AuthGuard)
  async save(@Req() req: Request, @Res() res: Response) {
    await this.userService.saveProfile(parseInt(req.session['uid']), req.body);
    res.redirect(302, `${this.appService.getDocRoot()}/`);
  }
}
