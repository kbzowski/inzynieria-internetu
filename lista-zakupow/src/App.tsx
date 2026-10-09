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
  const [items, setItems] = useState<Item[]>(initialItems)

  function toggleItem(id: string) {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item,
      ),
    )
  }

  return (
    <main>
      <h1>Lista zakupów</h1>
      <ItemForm />
      <ItemList items={items} onToggle={toggleItem} />
    </main>
  )
}

export default App
