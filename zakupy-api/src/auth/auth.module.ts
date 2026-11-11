import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../env.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RefreshTokensRepository } from './refresh-tokens.repository.js';
import { UsersRepository } from './users.repository.js';

@Module({
  imports: [
    JwtModule.register({
      // global: JwtService dostepny w kazdym module, takze dla AuthGuard w ItemsModule
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, RefreshTokensRepository],
})
export class AuthModule {}
