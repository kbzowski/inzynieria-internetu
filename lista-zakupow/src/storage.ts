import { z } from 'zod'
import { itemSchema, type Item } from './types.ts'

const STORAGE_KEY = 'lista-zakupow'

// w localStorage moze lezec cokolwiek: dane ze starszej wersji aplikacji
// albo tekst zmieniony recznie w narzedziach przegladarki, wiec sprawdzam je schematem
const savedItemsSchema = z.array(itemSchema)

export function loadItems(): Item[] {
  try {
    // null oznacza, ze jeszcze nic nie zapisano, wtedy biore pusta liste
    const saved = localStorage.getItem(STORAGE_KEY) ?? '[]'
    const data: unknown = JSON.parse(saved)
    // parse rzuca wyjatek, gdy dane maja inny ksztalt niz tablica produktow
    return savedItemsSchema.parse(data)
  } catch {
    // zly JSON albo zly ksztalt danych, wiec zaczynam od pustej listy
    return []
  }
}

export function saveItems(items: Item[]) {
  // localStorage przechowuje tylko tekst, dlatego tablice zamieniam na JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
