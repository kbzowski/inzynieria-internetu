import type { Item } from './types.ts'

const sampleItems: Item[] = [
  { id: '1', name: 'Mleko', bought: false },
  { id: '2', name: 'Chleb', bought: true },
]

function App() {
  // to samo co map, zapisane petla:
  // const rows = []
  // for (const item of sampleItems) {
  //   rows.push(<li key={item.id}>{item.name}</li>)
  // }
  const rows = sampleItems.map((item) => <li key={item.id}>{item.name}</li>)

  return (
    <main>
      <h1>Lista zakupów</h1>
      <ul>{rows}</ul>
    </main>
  )
}

export default App
