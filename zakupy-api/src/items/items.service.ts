import { Injectable, NotFoundException } from '@nestjs/common';
import type { ItemDto } from './item.dto.js';
import { ItemsRepository } from './items.repository.js';

@Injectable()
export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  findAll(bought?: boolean): ItemDto[] {
    return this.repository.findAll(bought);
  }

  findOne(id: string): ItemDto {
    const item = this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Nie ma produktu ${id}`);
    }
    return item;
  }
}
