import { useState } from 'react'
import type { Item } from './types.ts'
import ItemForm from './ItemForm.tsx'
import ItemList from './ItemList.tsx'

const sampleItems: Item[] = [
  { id: '1', name: 'Mleko', bought: false },
  { id: '2', name: 'Chleb', bought: true },
]

type AppProps = {
  initialItems?: Item[]
}

function App({ initialItems = sampleItems }: AppProps) {
  // useState zwraca tablice z dwoma elementami, to samo co:
  // const state = useState<Item[]>(initialItems)
  // const items = state[0]
  // const setItems = state[1]
  const [items, setItems] = useState<Item[]>(initialItems)

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

  return (
    <main>
      <h1>Lista zakupów</h1>
      <ItemForm onAdd={addItem} />
      <ItemList items={items} onToggle={toggleItem} onRemove={removeItem} />
    </main>
  )
}

export default App
