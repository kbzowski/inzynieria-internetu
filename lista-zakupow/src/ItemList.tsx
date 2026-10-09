import type { Item } from './types.ts'
import ItemRow from './ItemRow.tsx'

type ItemListProps = {
  items: Item[]
}

function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return <p>Lista jest pusta.</p>
  }

  return (
    <ul>
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default ItemList
