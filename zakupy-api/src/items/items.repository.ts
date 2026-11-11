import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CreateItemDto, ItemDto, UpdateItemDto } from './item.dto.js';

const sampleItems: ItemDto[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Mleko', bought: false },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Chleb', bought: true },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Jajka', bought: false },
];

// na razie dane w pamieci: po restarcie serwera wracaja przykladowe produkty
@Injectable()
export class ItemsRepository {
  private items: ItemDto[] = [...sampleItems];

  findAll(bought?: boolean): ItemDto[] {
    if (bought === undefined) {
      return this.items;
    }
    return this.items.filter((item) => item.bought === bought);
  }

  findById(id: string): ItemDto | undefined {
    return this.items.find((item) => item.id === id);
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
