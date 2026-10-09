import type { Item } from './types.ts'
import ItemRow from './ItemRow.tsx'

type ItemListProps = {
  items: Item[]
}

function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return <p>Lista jest pusta.</p>
  }

  // to samo co map, zapisane petla:
  // const rows = []
  // for (const item of items) {
  //   rows.push(<ItemRow key={item.id} item={item} />)
  // }
  const rows = items.map((item) => <ItemRow key={item.id} item={item} />)

  return <ul>{rows}</ul>
}

export default ItemList
