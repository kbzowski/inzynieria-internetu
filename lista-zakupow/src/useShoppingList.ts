import { useState } from 'react'
import type { Item } from './types.ts'

function useShoppingList(initialItems: Item[]) {
  const [items, setItems] = useState<Item[]>(initialItems)

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

  return { items, left, addItem, toggleItem, removeItem }
}

export default useShoppingList
