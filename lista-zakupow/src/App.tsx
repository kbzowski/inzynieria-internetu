import type { Item } from './types.ts'
import ItemForm from './ItemForm.tsx'
import ItemList from './ItemList.tsx'

const sampleItems: Item[] = [
  { id: '1', name: 'Mleko', bought: false },
  { id: '2', name: 'Chleb', bought: true },
]

function App() {
  return (
    <main>
      <h1>Lista zakupów</h1>
      <ItemForm />
      <ItemList items={sampleItems} />
    </main>
  )
}

export default App
