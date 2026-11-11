import { z } from 'zod';

// te same reguly co w itemSchema w lista-zakupow/src/types.ts
export const itemSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, 'Wpisz nazwę produktu')
    .max(50, 'Nazwa może mieć najwyżej 50 znaków'),
  bought: z.boolean(),
});
export type ItemDto = z.infer<typeof itemSchema>;

export const itemIdSchema = z.uuid();

export const createItemSchema = itemSchema.pick({ name: true });
export type CreateItemDto = z.infer<typeof createItemSchema>;

export const updateItemSchema = itemSchema
  .pick({ name: true, bought: true })
  .partial();
export type UpdateItemDto = z.infer<typeof updateItemSchema>;

export const itemsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  bought: z.stringbool().optional(),
  sort: z.enum(['name', '-name']).optional(),
});
export type ItemsQueryDto = z.infer<typeof itemsQuerySchema>;

export type ItemsSummaryDto = {
  total: number;
  left: number;
};
