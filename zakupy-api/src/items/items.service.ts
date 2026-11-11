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

  findAll(userId: string, query: ItemsQueryDto): Promise<ItemDto[]> {
    return this.repository.findAll(userId, query);
  }

  // cudzy produkt tez konczy sie 404, zeby nie zdradzac, ze istnieje
  async findOne(userId: string, id: string): Promise<ItemDto> {
    const item = await this.repository.findById(userId, id);
    if (!item) {
      throw new NotFoundException(`Nie ma produktu ${id}`);
    }
    return item;
  }

  async summary(userId: string): Promise<ItemsSummaryDto> {
    return {
      total: await this.repository.count(userId),
      left: await this.repository.count(userId, false),
    };
  }

  async create(userId: string, data: CreateItemDto): Promise<ItemDto> {
    if ((await this.repository.count(userId)) >= env.MAX_ITEMS) {
      throw new ConflictException('Lista jest pełna', {
        errorCode: 'ITEM_LIMIT',
      });
    }
    await this.checkNameIsFree(userId, data.name);
    const item = await this.repository.create(userId, data);
    this.logger.log('Item created', { id: item.id, name: item.name });
    return item;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateItemDto,
  ): Promise<ItemDto> {
    // findOne rzuca 404, gdy produktu nie ma
    const item = await this.findOne(userId, id);
    // nazwe sprawdzam tylko wtedy, gdy sie zmienia
    if (data.name !== undefined && data.name !== item.name) {
      await this.checkNameIsFree(userId, data.name);
    }
    return this.repository.update(userId, id, data);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.repository.remove(userId, id);
  }

  private async checkNameIsFree(userId: string, name: string) {
    if (await this.repository.findByName(userId, name)) {
      throw new ConflictException(`Produkt ${name} jest już na liście`, {
        errorCode: 'ITEM_EXISTS',
      });
    }
  }
}
