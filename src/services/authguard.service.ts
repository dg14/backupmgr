import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.session['logged'] == true) {
      let grant = null;
      if (
        request.url.startsWith((process.env.DOCROOT ?? '') + '/users') &&
        request.session['level'] != 1
      ) {
        grant = false;
      } else {
        grant = true;
      }
      if (
        request.url.startsWith((process.env.DOCROOT ?? '') + '/secmgr') &&
        [1, 2].indexOf(request.session['level']) == -1
      ) {
        grant = false;
      } else {
        grant = true;
      }
      return grant ?? true;
    } else {
      const response = context.switchToHttp().getResponse();
      this.logger.log("Redirect to login");
      response.redirect(302, this.appService.getDocRoot() + '/login');
      response.end();
      return false;
    }
  }
}
