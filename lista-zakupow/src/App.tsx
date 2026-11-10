import useShoppingList from './useShoppingList.ts'
import ItemForm from './ItemForm.tsx'
import ItemList from './ItemList.tsx'

function App() {
  // wyjmuje pola z obiektu zwroconego przez hook, to samo co:
  // const list = useShoppingList()
  // const items = list.items
  // const left = list.left
  // const addItem = list.addItem
  // const toggleItem = list.toggleItem
  // const removeItem = list.removeItem
  const { items, left, addItem, toggleItem, removeItem } = useShoppingList()

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
