import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  CreateItemDto,
  ItemDto,
  ItemsQueryDto,
  UpdateItemDto,
} from './item.dto.js';

const sampleItems: ItemDto[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Mleko', bought: false },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Chleb', bought: true },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Jajka', bought: false },
];

// na razie dane w pamieci: po restarcie serwera wracaja przykladowe produkty
@Injectable()
export class ItemsRepository {
  private items: ItemDto[] = [...sampleItems];

  findAll(query: ItemsQueryDto): ItemDto[] {
    let result = this.items;
    if (query.bought !== undefined) {
      result = result.filter((item) => item.bought === query.bought);
    }
    if (query.q !== undefined) {
      const q = query.q.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }
    if (query.sort === 'name') {
      result = result.toSorted((a, b) => a.name.localeCompare(b.name, 'pl'));
    }
    if (query.sort === '-name') {
      result = result.toSorted((a, b) => b.name.localeCompare(a.name, 'pl'));
    }
    return result;
  }

  findById(id: string): ItemDto | undefined {
    return this.items.find((item) => item.id === id);
  }

  findByName(name: string): ItemDto | undefined {
    return this.items.find((item) => item.name === name);
  }

  count(): number {
    return this.items.length;
  }

  create(data: CreateItemDto): ItemDto {
    const item: ItemDto = { id: randomUUID(), name: data.name, bought: false };
    this.items.push(item);
    return item;
  }

  update(id: string, data: UpdateItemDto): ItemDto {
    const index = this.items.findIndex((item) => item.id === id);
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }

  remove(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
