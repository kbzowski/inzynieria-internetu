import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../env.js';
import type {
  CreateItemDto,
  ItemDto,
  ItemsQueryDto,
  ItemsSummaryDto,
  UpdateItemDto,
} from './item.dto.js';
import { ItemsRepository } from './items.repository.js';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(private readonly repository: ItemsRepository) {}

  findAll(query: ItemsQueryDto): Promise<ItemDto[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<ItemDto> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Nie ma produktu ${id}`);
    }
    return item;
  }

  async summary(): Promise<ItemsSummaryDto> {
    return {
      total: await this.repository.count(),
      left: await this.repository.count(false),
    };
  }

  async create(data: CreateItemDto): Promise<ItemDto> {
    if ((await this.repository.count()) >= env.MAX_ITEMS) {
      throw new ConflictException('Lista jest pełna', {
        errorCode: 'ITEM_LIMIT',
      });
    }
    await this.checkNameIsFree(data.name);
    const item = await this.repository.create(data);
    this.logger.log('Item created', { id: item.id, name: item.name });
    return item;
  }

  async update(id: string, data: UpdateItemDto): Promise<ItemDto> {
    // findOne rzuca 404, gdy produktu nie ma
    const item = await this.findOne(id);
    // nazwe sprawdzam tylko wtedy, gdy sie zmienia
    if (data.name !== undefined && data.name !== item.name) {
      await this.checkNameIsFree(data.name);
    }
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.remove(id);
  }

  private async checkNameIsFree(name: string) {
    if (await this.repository.findByName(name)) {
      throw new ConflictException(`Produkt ${name} jest już na liście`, {
        errorCode: 'ITEM_EXISTS',
      });
    }
  }
}
