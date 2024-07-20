import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/services/authguard.service';
import { MssqlService } from 'src/services/mssql.service';

@Controller('secexp')
export class SecurityExplorerController {
  constructor(
    private mssqlService: MssqlService,
    private readonly appService: AppService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('secexp_list')
  async getDbs(@Req() req: Request) {
    return {
      dbs: await this.mssqlService.getDbs(),
	  users: await this.mssqlService.getUsers(),
	  roles: await this.mssqlService.getRoles(),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('details/:name')
  @UseGuards(AuthGuard)
  @Render('secexp_details')
  async index(@Req() req: Request) {
    let db = req.params['name'];

    return {
      db: db,
      items: this.mssqlService.getSecurityReport(db),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
}
