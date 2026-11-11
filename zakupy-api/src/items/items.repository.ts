import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateItemDto,
  ItemDto,
  ItemsQueryDto,
  UpdateItemDto,
} from './item.dto.js';

const sortOrder = {
  name: { name: 'asc' },
  '-name': { name: 'desc' },
} as const;

// pola wysylane klientowi, bez userId
const select = { id: true, name: true, bought: true };

// kazde zapytanie ma userId w where: uzytkownik widzi i zmienia tylko swoje produkty
@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, query: ItemsQueryDto): Promise<ItemDto[]> {
    // pola z wartoscia undefined Prisma pomija, wiec brak parametru = brak filtra
    return this.prisma.item.findMany({
      where: { userId, bought: query.bought, name: { contains: query.q } },
      orderBy: query.sort ? sortOrder[query.sort] : { id: 'asc' },
      select,
    });
  }

  findById(userId: string, id: string): Promise<ItemDto | null> {
    return this.prisma.item.findFirst({ where: { userId, id }, select });
  }

  findByName(userId: string, name: string): Promise<ItemDto | null> {
    return this.prisma.item.findFirst({ where: { userId, name }, select });
  }

  count(userId: string, bought?: boolean): Promise<number> {
    return this.prisma.item.count({ where: { userId, bought } });
  }

  create(userId: string, data: CreateItemDto): Promise<ItemDto> {
    return this.prisma.item.create({ data: { ...data, userId }, select });
  }

  update(userId: string, id: string, data: UpdateItemDto): Promise<ItemDto> {
    return this.prisma.item.update({ where: { userId, id }, data, select });
  }

  async remove(userId: string, id: string) {
    await this.prisma.item.delete({ where: { userId, id } });
  }
}
