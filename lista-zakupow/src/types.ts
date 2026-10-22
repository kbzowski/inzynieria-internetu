import { z } from 'zod'

export const itemSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, 'Wpisz nazwę produktu')
    .max(50, 'Nazwa może mieć najwyżej 50 znaków'),
  bought: z.boolean(),
})

export type Item = z.infer<typeof itemSchema>

export const newItemSchema = itemSchema.pick({ name: true })
