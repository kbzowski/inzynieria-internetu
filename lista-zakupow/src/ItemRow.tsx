import type { Item } from './types.ts'

type ItemRowProps = {
  item: Item
  onToggle: (id: string) => void
}

function ItemRow({ item, onToggle }: ItemRowProps) {
  return (
    <li>
      <label className={item.bought ? 'bought' : ''}>
        <input
          type="checkbox"
          checked={item.bought}
          onChange={() => onToggle(item.id)}
        />
        {item.name}
      </label>
      <button aria-label={`Usuń ${item.name}`}>Usuń</button>
    </li>
  )
}

export default ItemRow
