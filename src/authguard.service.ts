import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();    
    if (request.session.logged == true) {
      return true;
    } else {
      const response = context.switchToHttp().getResponse();
      response.redirect(302,'/login');
      return false;
    }
  }
}
