import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateItemDto,
  ItemDto,
  ItemsQueryDto,
  ItemsSummaryDto,
  UpdateItemDto,
} from './item.dto.js';
import { ItemsRepository } from './items.repository.js';

const MAX_ITEMS = 50;

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

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

  summary(): ItemsSummaryDto {
    return {
      total: this.repository.count(),
      left: this.repository.count(false),
    };
  }

  create(data: CreateItemDto): ItemDto {
    if (this.repository.count() >= MAX_ITEMS) {
      throw new ConflictException('Lista jest pełna', {
        errorCode: 'ITEM_LIMIT',
      });
    }
    this.checkNameIsFree(data.name);
    const item = this.repository.create(data);
    this.logger.log('Item created', { id: item.id, name: item.name });
    return item;
  }

  update(id: string, data: UpdateItemDto): ItemDto {
    // findOne rzuca 404, gdy produktu nie ma
    const item = this.findOne(id);
    // nazwe sprawdzam tylko wtedy, gdy sie zmienia
    if (data.name !== undefined && data.name !== item.name) {
      this.checkNameIsFree(data.name);
    }
    return this.repository.update(id, data);
  }

  remove(id: string) {
    this.findOne(id);
    this.repository.remove(id);
  }

  private checkNameIsFree(name: string) {
    if (this.repository.findByName(name)) {
      throw new ConflictException(`Produkt ${name} jest już na liście`, {
        errorCode: 'ITEM_EXISTS',
      });
    }
  }
}
