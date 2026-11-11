import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

// zapytanie z dopisanym przez straznika id zalogowanego uzytkownika
export type AuthRequest = Request & { userId: string };

type AccessTokenPayload = { sub: string };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    // naglowek ma postac: Authorization: Bearer <token>
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Brak tokenu');
    }
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
      request.userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token');
    }
    return true;
  }
}
