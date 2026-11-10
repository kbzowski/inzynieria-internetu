import { z } from 'zod'
import { itemSchema, type Item } from './types.ts'

const STORAGE_KEY = 'lista-zakupow'

const savedItemsSchema = z.array(itemSchema)

export function loadItems(): Item[] {
  try {
    // null, gdy nic jeszcze nie zapisano
    const saved = localStorage.getItem(STORAGE_KEY) ?? '[]'
    const data: unknown = JSON.parse(saved)
    return savedItemsSchema.parse(data)
  } catch {
    // zly JSON albo dane innego ksztaltu
    return []
  }
}

export function saveItems(items: Item[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
