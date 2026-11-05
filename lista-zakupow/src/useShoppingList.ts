import { useEffect, useState } from 'react'
import type { Item } from './types.ts'
import { loadItems, saveItems } from './storage.ts'

function useShoppingList(initialItems: Item[]) {
  // funkcje startowa React wywoluje tylko przy pierwszym rysowaniu,
  // wiec localStorage jest czytany raz, a nie przy kazdym rysowaniu
  const [items, setItems] = useState<Item[]>(() => loadItems(initialItems))

  // localStorage jest poza Reactem, efekt zapisuje do niego liste po kazdej zmianie items
  useEffect(() => {
    saveItems(items)
  }, [items])

  const left = items.filter((item) => !item.bought).length

  function addItem(name: string) {
    const item: Item = { id: crypto.randomUUID(), name, bought: false }
    setItems([...items, item])
  }

  function toggleItem(id: string) {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item,
      ),
    )
  }

  function removeItem(id: string) {
    setItems(items.filter((item) => item.id !== id))
  }

  // { items, left } to skrot od { items: items, left: left }, tak samo dla funkcji
  return { items, left, addItem, toggleItem, removeItem }
}

export default useShoppingList
