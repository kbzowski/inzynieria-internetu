import { z } from 'zod'
import { itemSchema, type Item } from './types.ts'

const STORAGE_KEY = 'lista-zakupow'

// w localStorage moze lezec cokolwiek: dane ze starszej wersji aplikacji
// albo tekst zmieniony recznie w narzedziach przegladarki, wiec sprawdzam je schematem
const savedItemsSchema = z.array(itemSchema)

export function loadItems(fallback: Item[]): Item[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  // null oznacza, ze jeszcze nic nie zapisano
  if (saved === null) {
    return fallback
  }

  let data: unknown
  try {
    data = JSON.parse(saved)
  } catch {
    // zapisany tekst nie jest poprawnym JSON-em
    return fallback
  }

  const result = savedItemsSchema.safeParse(data)
  if (!result.success) {
    return fallback
  }
  return result.data
}

export function saveItems(items: Item[]) {
  // localStorage przechowuje tylko tekst, dlatego tablice zamieniam na JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
