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

  return (
    <main>
      <h1>Lista zakupów</h1>
      <ItemForm onAdd={addItem} />
      <ItemList items={items} onToggle={toggleItem} onRemove={removeItem} />
      <p>Do kupienia: {left}</p>
    </main>
  )
}

export default App
