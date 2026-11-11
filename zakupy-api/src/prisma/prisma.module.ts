import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global: PrismaService dostepny we wszystkich modulach bez importowania PrismaModule
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
