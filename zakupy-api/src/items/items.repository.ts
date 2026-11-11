import { Injectable } from '@nestjs/common';
import type { ItemDto } from './item.dto.js';

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
}
