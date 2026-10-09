import type { Item } from './types.ts'

type ItemRowProps = {
  item: Item
}

// { item } wyjmuje pola z obiektu props, to samo co:
// function ItemRow(props: ItemRowProps) {
//   const item = props.item
//   ...
// }
function ItemRow({ item }: ItemRowProps) {
  return (
    <li>
      <label className={item.bought ? 'bought' : ''}>
        <input type="checkbox" checked={item.bought} readOnly />
        {item.name}
      </label>
      <button aria-label={`Usuń ${item.name}`}>Usuń</button>
    </li>
  )
}

export default ItemRow
