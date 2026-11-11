import { Injectable } from '@nestjs/common';
import type { ItemDto } from './item.dto.js';
import { ItemsRepository } from './items.repository.js';

@Injectable()
export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  findAll(): ItemDto[] {
    return this.repository.findAll();
  }
}
