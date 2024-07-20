import { Controller, Get, Post, Render, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from '../app.service';
import { AuthGuard } from '../services/authguard.service';
import { RestoreService } from '../services/restore.service';

@Controller('restores')
export class RestoreController {
  constructor(
    private restoreService: RestoreService,
    private appService: AppService,
  ) { }

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
      file: req.params['id'],
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Get('restore/:id')
  @Render('restore_action')
  @UseGuards(AuthGuard)
  async restoreForm(@Req() req: Request, @Res() res: Response) {
    return {
      name: req.params['id'],
      file: req.params['id'],
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Post('restore/:id')
  @Render('restore_action')
  @UseGuards(AuthGuard)
  async restoreDb(@Req() req: Request, @Res() res: Response) {
    let file = req.params['id'];
    let name = req.body.name;
    let results = await this.restoreService.restore(file, name);
    return {
      name: req.body.name,
      file: req.params['id'],
      results: results ?? 'success',
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
}
