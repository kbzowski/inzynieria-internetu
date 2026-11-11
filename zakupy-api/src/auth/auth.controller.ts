import { Body, Controller, Cookies, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { env } from '../env.js';
import {
  credentialsSchema,
  type AuthResponseDto,
  type CredentialsDto,
} from './auth.dto.js';
import { AuthService, type Session } from './auth.service.js';

const REFRESH_COOKIE = 'refresh_token';

// refresh token tylko w ciasteczku httpOnly: JavaScript strony go nie odczyta
function sendSession(response: Response, session: Session): AuthResponseDto {
  response.cookie(REFRESH_COOKIE, session.refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    // przegladarka wysle ciasteczko tylko do /auth/..., a nie do /items
    path: '/auth',
    // w Expressie maxAge podaje sie w milisekundach
    maxAge: env.REFRESH_TOKEN_TTL * 1000,
  });
  return { accessToken: session.accessToken, user: session.user };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body({ schema: credentialsSchema }) data: CredentialsDto) {
    return this.authService.register(data);
  }

  // logowanie niczego nie tworzy, wiec 200 zamiast domyslnego dla POST 201
  @Post('login')
  @HttpCode(200)
  async login(
    @Body({ schema: credentialsSchema }) data: CredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return sendSession(response, await this.authService.login(data));
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Cookies(REFRESH_COOKIE) refreshToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return sendSession(response, await this.authService.refresh(refreshToken));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Cookies(REFRESH_COOKIE) refreshToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(refreshToken);
    response.clearCookie(REFRESH_COOKIE, { path: '/auth' });
  }
}
