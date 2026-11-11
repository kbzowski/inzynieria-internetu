import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { credentialsSchema, type CredentialsDto } from './auth.dto.js';
import { AuthService } from './auth.service.js';

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
  login(@Body({ schema: credentialsSchema }) data: CredentialsDto) {
    return this.authService.login(data);
  }
}
