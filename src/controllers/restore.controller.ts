import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/authguard.service';
import { RestoreService } from 'src/services/restore.service';

@Controller('restores')
export class RestoreController {
  constructor(private restoreService: RestoreService) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('restore_list')
  async getallBacks() {
    return {
      list: this.restoreService.enum(),
      DOCROOT: process.env.SUFFIX_URL,
    };
  }

  @Get('details/:id')
  @UseGuards(AuthGuard)
  @Render('restore_details')
  async getDetails(@Req() req) {
    let meta = await this.restoreService.analyze(req.params['id']);
    return {
      meta: meta,
      DOCROOT: process.env.SUFFIX_URL,
    };
  }
}
