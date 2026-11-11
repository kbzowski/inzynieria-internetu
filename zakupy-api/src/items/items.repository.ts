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

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ItemsQueryDto): Promise<ItemDto[]> {
    // pola z wartoscia undefined Prisma pomija, wiec brak parametru = brak filtra
    return this.prisma.item.findMany({
      where: { bought: query.bought, name: { contains: query.q } },
      orderBy: query.sort ? sortOrder[query.sort] : { id: 'asc' },
    });
  }

  findById(id: string): Promise<ItemDto | null> {
    return this.prisma.item.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<ItemDto | null> {
    return this.prisma.item.findUnique({ where: { name } });
  }

  count(bought?: boolean): Promise<number> {
    return this.prisma.item.count({ where: { bought } });
  }

  create(data: CreateItemDto): Promise<ItemDto> {
    return this.prisma.item.create({ data });
  }

  update(id: string, data: UpdateItemDto): Promise<ItemDto> {
    return this.prisma.item.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.item.delete({ where: { id } });
  }
}
