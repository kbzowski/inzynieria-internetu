import type { Item } from './types.ts'
import useShoppingList from './useShoppingList.ts'
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
  const { items, left, addItem, toggleItem, removeItem } =
    useShoppingList(initialItems)

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
