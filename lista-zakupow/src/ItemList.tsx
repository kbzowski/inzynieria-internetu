import type { Item } from './types.ts'
import ItemRow from './ItemRow.tsx'

type ItemListProps = {
  items: Item[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function ItemList({ items, onToggle, onRemove }: ItemListProps) {
  if (items.length === 0) {
    return <p>Lista jest pusta.</p>
  }

  return (
    <ul>
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </ul>
  )
}

export default ItemList
