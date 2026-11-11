import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { CreateItemDto, UpdateItemDto } from './item.dto.js';
import { ItemsService } from './items.service.js';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(
    @Query('bought', new ParseBoolPipe({ optional: true })) bought?: boolean,
  ) {
    return this.itemsService.findAll(bought);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateItemDto) {
    return this.itemsService.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateItemDto) {
    return this.itemsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.itemsService.remove(id);
  }
}
