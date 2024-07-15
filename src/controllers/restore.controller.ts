import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from '../app.service';
import { AuthGuard } from '../services/authguard.service';
import { RestoreService } from '../services/restore.service';

@Controller('restores')
export class RestoreController {
  constructor(
    private restoreService: RestoreService,
    private appService: AppService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('restore_list')
  async getallBacks(@Req() req: Request) {
    return {
      level: this.appService.getUserLevel(req),
      list: this.restoreService.enum(),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('details/:id')
  @UseGuards(AuthGuard)
  @Render('restore_details')
  async getDetails(@Req() req: Request) {
    let meta = await this.restoreService.analyze(req.params['id']);
    return {
      level: this.appService.getUserLevel(req),
      meta: meta,
      DOCROOT: this.appService.getDocRoot(),
    };
  }
}
