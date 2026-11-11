import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateItemDto,
  ItemDto,
  ItemsQueryDto,
  UpdateItemDto,
} from './item.dto.js';
import { ItemsRepository } from './items.repository.js';

@Injectable()
export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  findAll(query: ItemsQueryDto): ItemDto[] {
    return this.repository.findAll(query);
  }

  findOne(id: string): ItemDto {
    const item = this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Nie ma produktu ${id}`);
    }
    return item;
  }

  create(data: CreateItemDto): ItemDto {
    return this.repository.create(data);
  }

  update(id: string, data: UpdateItemDto): ItemDto {
    // findOne rzuca 404, gdy produktu nie ma
    this.findOne(id);
    return this.repository.update(id, data);
  }

  remove(id: string) {
    this.findOne(id);
    this.repository.remove(id);
  }
}
