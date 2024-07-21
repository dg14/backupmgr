import {
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/services/authguard.service';
import { MssqlService } from 'src/services/mssql.service';

@Controller('secman')
export class SecurityManagerController {
  constructor(
    private mssqlService: MssqlService,
    private readonly appService: AppService,
  ) {}
  private readonly logger = new Logger(SecurityManagerController.name);

  @Get()
  @UseGuards(AuthGuard)
  @Render('secman_list')
  async getDbs(@Req() req: Request) {
    return {
      dbs: await this.mssqlService.getDbs(),
      users: await this.mssqlService.getUsers(),
      roles: await this.mssqlService.getRoles(),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('db/:db')
  @UseGuards(AuthGuard)
  @Render('secman_details')
  async index(@Req() req: Request) {
    let db = req.params['db'];

    return {
      db: db,
      items: this.mssqlService.getSecurityReport(db),
      level: this.appService.getUserLevel(req),
      roles: this.mssqlService.getDBRoles(db),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('user/add')
  @UseGuards(AuthGuard)
  @Render('secmgr_adduser')
  async addUser(
    @Req() req: Request,
    @Query('error') error: boolean,
    @Query('message') message: string,
  ) {
    return {
      message: message,
      error: error ?? false,
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Post('user/add')
  @UseGuards(AuthGuard)
  async addUserAction(@Req() req: Request, @Res() res: Response) {
    let error = false,
      message = '';
    let pass = '';
    if (
      req.body.pwd1string &&
      req.body.pwd1string != '' &&
      req.body.pwd2string &&
      req.body.pwd2string != '' &&
      req.body.pwd1string == req.body.pwd2string
    ) {
      pass = req.body.pwd1string;
    } else {
      message = 'Password error';
      error = true;
    }
    if (!error) {
      try {
        await this.mssqlService.addUser(req.body.login, pass);
      } catch (e) {
        error = true;
        message = e.message;
        this.logger.error(e.message, e.stack);
      }
    }
    if (!error) {
      this.logger.log('Redirect to list addUser ok');
      res.redirect(this.appService.getDocRoot() + '/secman');
      res.end();
      return null;
    } else {
      this.logger.log('Redirect to list addUser error');
      res.redirect(
        this.appService.getDocRoot() +
          '/secman/user/add?message=' +
          encodeURIComponent(message) +
          '&=error=true',
      );
      res.end();
    }
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  @Render('secmgr_detailsuser')
  async detailsUser(
    @Req() req: Request,
    @Query('error') error: boolean,
    @Query('message') message: string,
  ) {
    return {
      user: req.params.id,
      roles: await this.mssqlService.getRolesForUser(req.params.id),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
      message: message,
      error: error,
    };
  }
  @Get('user/:id/dropuser')
  @UseGuards(AuthGuard)
  async dropUser(@Req() req: Request, @Res() res: Response) {
    let user = req.params.id;
    let roles = await this.mssqlService.getRolesForUser(user);
    if (roles.length == 0) {
      await this.mssqlService.dropUser(user);
      res.redirect(this.appService.getDocRoot() + '/secman/');
    } else {
      res.redirect(
        this.appService.getDocRoot() +
          '/secman/user/' +
          user +
          '?error=true&message=active_roles_for_user',
      );
    }
  }

  @Get('db/:db/user/add')
  @UseGuards(AuthGuard)
  @Render('secmgr_addusertodb')
  async addUserToDb(
    @Req() req: Request,
    @Query('error') error: boolean,
    @Query('message') message: string,
  ) {
    return {
      message: message,
      error: error,
      database: req.params['db'],
      users: this.mssqlService.getUsers(),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Post('db/:db/user/add')
  @UseGuards(AuthGuard)
  async addUserToDbAction(@Req() req: Request, @Res() res: Response) {
    let error = false,
      message = '';
    let database = req.body.database;
    let user = req.body.user;
    try {
      await this.mssqlService.addUserToDB(user, database);
    } catch (e) {
      error = true;
      message = e.message;
      this.logger.error(e.message, e.stack);
    }
    if (!error) {
      res.redirect(this.appService.getDocRoot() + '/secman/db/' + database);
      res.end();
      this.logger.log('Redirect to list addUserToDB');
      return null;
    } else {
      this.logger.log('Redirect to user addUserToDB ok');
      res.redirect(
        this.appService.getDocRoot() +
          '/secman/db/' +
          database +
          '/useradd?error=true&message=' +
          encodeURIComponent(message),
      );
      res.end();
    }
  }
  @Get('db/:db/user/:user')
  @UseGuards(AuthGuard)
  @Render('secmgr_detailsdbuser')
  async detailsUserDb(@Req() req: Request) {
    let user = req.params['user'];
    let database = req.params['db'];
    return {
      user: user,
      database: database,
      roles: this.mssqlService.getRolesForUserInDB(user, database),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('db/:db/user/:user/addrole')
  @UseGuards(AuthGuard)
  @Render('secmgr_grantroletouser')
  async grantRoleToUser(
    @Req() req: Request,
    @Query('error') error: boolean,
    @Query('message') message: string,
  ) {
    let user = req.params['user'];
    let database = req.params['db'];
    return {
      user: user,
      database: database,
      error: error ?? false,
      message: message,
      roles: this.mssqlService.getDBRoles(database),
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Post('db/:db/user/:user/addrole')
  @UseGuards(AuthGuard)
  async grantRoleToUserAction(@Req() req: Request, @Res() res: Response) {
    console.log(req.body);
    let user = req.params['user'];
    let database = req.params['db'];
    let role = req.body.role;
    let error = false,
      message = '';
    try {
      await this.mssqlService.grantUserPermission(user, role, database);
    } catch (e) {
      error = true;
      message = e.message;
      this.logger.error(e.message, e.stack);
    }
    if (!error) {
      this.logger.log('Redirect to user grantRoleToUser');
      res.redirect(
        this.appService.getDocRoot() +
          '/secman/db/' +
          database +
          '/user/' +
          user,
      );
      res.end();
    } else {
      this.logger.log('Redirect to user grantRoleToUser ok');

      res.redirect(
        this.appService.getDocRoot() +
          '/secman/db/' +
          database +
          '/user/' +
          user +
          '/addrole?error=true&message=' +
          encodeURIComponent(message),
      );
      res.end();
    }
  }
  @Get('db/:db/user/:user/role/:role/droprole')
  @UseGuards(AuthGuard)
  async dropRoleToUser(@Req() req: Request, @Res() res: Response) {
    await this.mssqlService.dropDBUserRole(
      req.params['db'],
      req.params['user'],
      req.params['role'],
    );
    res.redirect(
      this.appService.getDocRoot() +
        '/secman/db/' +
        req.params['db'] +
        '/user/' +
        req.params['user'],
    );
    this.logger.log('Redirect to user dropRoleToUser');
    return null;
  }

  @Get('db/:db/user/:user/dropuser')
  @UseGuards(AuthGuard)
  async dropUserFromDb(@Req() req: Request, @Res() res: Response) {
    let user = req.params['user'];
    let database = req.params['db'];
    await this.mssqlService.dropUserToDb(user, database);
    res.redirect(
      this.appService.getDocRoot() + '/secman/db/' + req.params['db'],
    );
    res.end();
    this.logger.log('Redirect to list dropUserFromDb');
    return null;
  }
}
