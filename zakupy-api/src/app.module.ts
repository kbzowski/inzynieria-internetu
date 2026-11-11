import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ItemsModule } from './items/items.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, AuthModule, ItemsModule],
})
export class AppModule {}
