import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UserDto } from './auth.dto.js';

export type StoredRefreshToken = { expiresAt: Date; user: UserDto };

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date) {
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  findByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { expiresAt: true, user: { select: { id: true, email: true } } },
    });
  }

  // false, gdy tokenu juz nie bylo (np. usunelo go rownolegle zapytanie)
  async remove(tokenHash: string): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
    return count > 0;
  }
}
