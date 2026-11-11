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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, type AuthRequest } from '../auth/auth.guard.js';
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

// wszystkie trasy tylko dla zalogowanych
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(
    @Req() request: AuthRequest,
    @Query({ schema: itemsQuerySchema }) query: ItemsQueryDto,
  ) {
    return this.itemsService.findAll(request.userId, query);
  }

  @Get(':id')
  findOne(
    @Req() request: AuthRequest,
    @Param('id', { schema: itemIdSchema }) id: string,
  ) {
    return this.itemsService.findOne(request.userId, id);
  }

  // celowo za ':id', zeby pokazac zasloniecie trasy (opis w README, krok 7)
  @Get('summary')
  summary(@Req() request: AuthRequest) {
    return this.itemsService.summary(request.userId);
  }

  @Post()
  create(
    @Req() request: AuthRequest,
    @Body({ schema: createItemSchema }) data: CreateItemDto,
  ) {
    return this.itemsService.create(request.userId, data);
  }

  @Patch(':id')
  update(
    @Req() request: AuthRequest,
    @Param('id', { schema: itemIdSchema }) id: string,
    @Body({ schema: updateItemSchema }) data: UpdateItemDto,
  ) {
    return this.itemsService.update(request.userId, id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Req() request: AuthRequest,
    @Param('id', { schema: itemIdSchema }) id: string,
  ) {
    return this.itemsService.remove(request.userId, id);
  }
}
