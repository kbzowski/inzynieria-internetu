import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  createItemSchema,
  itemIdSchema,
  itemsQuerySchema,
  updateItemSchema,
  type CreateItemDto,
  type ItemsQueryDto,
  type UpdateItemDto,
} from './item.dto.js';
import { ItemsService } from './items.service.js';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@Query({ schema: itemsQuerySchema }) query: ItemsQueryDto) {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', { schema: itemIdSchema }) id: string) {
    return this.itemsService.findOne(id);
  }

  @Post()
  create(@Body({ schema: createItemSchema }) data: CreateItemDto) {
    return this.itemsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: itemIdSchema }) id: string,
    @Body({ schema: updateItemSchema }) data: UpdateItemDto,
  ) {
    return this.itemsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', { schema: itemIdSchema }) id: string) {
    this.itemsService.remove(id);
  }
}
