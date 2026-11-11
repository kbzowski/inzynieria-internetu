import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import type { AuthResponseDto, CredentialsDto, UserDto } from './auth.dto.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
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

  async login(data: CredentialsDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(data.email);
    // ten sam komunikat dla zlego e-maila i zlego hasla; czas odpowiedzi nadal
    // zdradza, czy konto istnieje (opis w README, krok 11)
    if (!user || !(await argon2.verify(user.passwordHash, data.password))) {
      throw new UnauthorizedException('Zły e-mail lub hasło', {
        errorCode: 'INVALID_CREDENTIALS',
      });
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken, user: { id: user.id, email: user.email } };
  }
}
