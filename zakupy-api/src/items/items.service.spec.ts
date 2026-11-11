import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CreateItemDto, ItemDto } from './item.dto.js';
import { ItemsRepository } from './items.repository.js';
import { ItemsService } from './items.service.js';

const USER_ID = 'user-1';

// repozytorium w pamieci zamiast bazy: test sprawdza tylko reguly serwisu
class FakeItemsRepository {
  items: ItemDto[] = [{ id: 'id-1', name: 'Mleko', bought: false }];

  async findById(_userId: string, id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByName(_userId: string, name: string) {
    return this.items.find((item) => item.name === name) ?? null;
  }

  async count() {
    return this.items.length;
  }

  async create(_userId: string, data: CreateItemDto) {
    const item = { id: `id-${this.items.length + 1}`, bought: false, ...data };
    this.items.push(item);
    return item;
  }
}

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: ItemsRepository, useValue: new FakeItemsRepository() },
      ],
    }).compile();
    service = moduleRef.get(ItemsService);
  });

  it('dodaje produkt', async () => {
    const item = await service.create(USER_ID, { name: 'Chleb' });
    expect(item).toMatchObject({ name: 'Chleb', bought: false });
  });

  it('odrzuca nazwę, która już jest na liście', async () => {
    await expect(service.create(USER_ID, { name: 'Mleko' })).rejects.toThrow(
      'jest już na liście',
    );
  });

  it('odrzuca produkt ponad limit MAX_ITEMS (3 w vitest.config.ts)', async () => {
    await service.create(USER_ID, { name: 'Chleb' });
    await service.create(USER_ID, { name: 'Jajka' });
    await expect(service.create(USER_ID, { name: 'Ser' })).rejects.toThrow(
      'Lista jest pełna',
    );
  });

  it('zgłasza 404 dla nieznanego produktu', async () => {
    await expect(service.findOne(USER_ID, 'brak')).rejects.toThrow(
      NotFoundException,
    );
  });
});
