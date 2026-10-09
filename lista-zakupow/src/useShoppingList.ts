import { useState } from 'react'
import type { Item } from './types.ts'

function useShoppingList(initialItems: Item[]) {
  // useState zwraca tablice z dwoma elementami, to samo co:
  // const state = useState<Item[]>(initialItems)
  // const items = state[0]
  // const setItems = state[1]
  const [items, setItems] = useState<Item[]>(initialItems)

  // to samo co filter, zapisane petla:
  // const notBought = []
  // for (const item of items) {
  //   if (!item.bought) {
  //     notBought.push(item)
  //   }
  // }
  // const left = notBought.length
  const left = items.filter((item) => !item.bought).length

  function addItem(name: string) {
    // samo name to skrot od name: name
    const item: Item = { id: crypto.randomUUID(), name, bought: false }
    // to samo co [...items, item], zapisane petla:
    // const next = []
    // for (const oldItem of items) {
    //   next.push(oldItem)
    // }
    // next.push(item)
    // setItems(next)
    // samo items.push(item) nie wystarczy, bo React odswieza widok
    // dopiero, gdy dostanie nowa tablice
    setItems([...items, item])
  }

  function toggleItem(id: string) {
    // to samo co map, zapisane petla:
    // const next = []
    // for (const item of items) {
    //   if (item.id === id) {
    //     next.push({ id: item.id, name: item.name, bought: !item.bought })
    //   } else {
    //     next.push(item)
    //   }
    // }
    // setItems(next)
    // { ...item, bought: !item.bought } kopiuje wszystkie pola item
    // i nadpisuje bought
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item,
      ),
    )
  }

  function removeItem(id: string) {
    // to samo co filter, zapisane petla:
    // const next = []
    // for (const item of items) {
    //   if (item.id !== id) {
    //     next.push(item)
    //   }
    // }
    // setItems(next)
    setItems(items.filter((item) => item.id !== id))
  }

  // { items, left } to skrot od { items: items, left: left }, tak samo dla funkcji
  return { items, left, addItem, toggleItem, removeItem }
}

export default useShoppingList
