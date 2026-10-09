import type { Item } from './types.ts'

type ItemRowProps = {
  item: Item
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function ItemRow({ item, onToggle, onRemove }: ItemRowProps) {
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
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Usuń ${item.name}`}
      >
        Usuń
      </button>
    </li>
  )
}

export default ItemRow
