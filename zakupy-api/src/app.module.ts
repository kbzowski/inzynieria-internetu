import { Module } from '@nestjs/common';
import { ItemsModule } from './items/items.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, ItemsModule],
})
export class AppModule {}
