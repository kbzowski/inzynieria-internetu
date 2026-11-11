import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
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
}
