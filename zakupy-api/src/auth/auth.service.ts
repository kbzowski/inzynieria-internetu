import { createHash, randomBytes } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { env } from '../env.js';
import type { AuthResponseDto, CredentialsDto, UserDto } from './auth.dto.js';
import { RefreshTokensRepository } from './refresh-tokens.repository.js';
import { UsersRepository } from './users.repository.js';

// odpowiedz dla klienta i refresh token, ktory kontroler wysle w ciasteczku
export type Session = AuthResponseDto & { refreshToken: string };

// w bazie tylko skrot: wyciek tabeli nie daje gotowych tokenow
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(data: CredentialsDto): Promise<UserDto> {
    if (await this.users.findByEmail(data.email)) {
      throw new ConflictException('Ten e-mail jest już zajęty', {
        errorCode: 'EMAIL_TAKEN',
      });
    }
    const passwordHash = await argon2.hash(data.password);
    return this.users.create(data.email, passwordHash);
  }

  async login(data: CredentialsDto): Promise<Session> {
    const user = await this.users.findByEmail(data.email);
    // ten sam komunikat dla zlego e-maila i zlego hasla; czas odpowiedzi nadal
    // zdradza, czy konto istnieje (opis w README, krok 11)
    if (!user || !(await argon2.verify(user.passwordHash, data.password))) {
      throw new UnauthorizedException('Zły e-mail lub hasło', {
        errorCode: 'INVALID_CREDENTIALS',
      });
    }
    return this.createSession({ id: user.id, email: user.email });
  }

  async refresh(refreshToken: string | undefined): Promise<Session> {
    if (!refreshToken) {
      throw new UnauthorizedException('Brak refresh tokenu');
    }
    const tokenHash = hashToken(refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);
    // rotacja: kazdy refresh token dziala tylko raz
    const removed = await this.refreshTokens.remove(tokenHash);
    if (!stored || !removed || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesja wygasła, zaloguj się ponownie');
    }
    return this.createSession(stored.user);
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      await this.refreshTokens.remove(hashToken(refreshToken));
    }
  }

  private async createSession(user: UserDto): Promise<Session> {
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    const refreshToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL * 1000);
    await this.refreshTokens.create(
      user.id,
      hashToken(refreshToken),
      expiresAt,
    );
    return { accessToken, refreshToken, user };
  }
}
