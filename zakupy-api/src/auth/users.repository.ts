import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UserDto } from './auth.dto.js';

export type UserWithPassword = UserDto & { passwordHash: string };

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ze skrotem hasla, tylko do logowania; skrot nigdy nie trafia do odpowiedzi
  findByEmail(email: string): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(email: string, passwordHash: string): Promise<UserDto> {
    return this.prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });
  }
}
