import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token required');
    }

    const accessToken = token.replace('Bearer ', '');

    // Aquí podrías verificar el token con tu lógica JWT o llamada externa
    if (accessToken !== '123456') {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
