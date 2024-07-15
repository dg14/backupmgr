import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/authguard.service';
import { RestoreService } from 'src/services/restore.service';

@Controller('restores')
export class RestoreController {
  constructor(
    private restoreService: RestoreService,
    private appService: AppService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('restore_list')
  async getallBacks() {
    return {
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
      meta: meta,
      DOCROOT: this.appService.getDocRoot(),
    };
  }
}
