import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppService } from 'src/app.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly appService: AppService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.session['logged'] == true) {
      if (
        request.url.startsWith((process.env.DOCROOT ?? '') + '/users') &&
        request.session['level'] != 1
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      const response = context.switchToHttp().getResponse();
      response.redirect(302, this.appService.getDocRoot() + '/login');
      return false;
    }
  }
}
