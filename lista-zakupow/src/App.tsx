import type { Item } from './types.ts'

const sampleItems: Item[] = [
  { id: '1', name: 'Mleko', bought: false },
  { id: '2', name: 'Chleb', bought: true },
]

function App() {
  return (
    <main>
      <h1>Lista zakupów</h1>
      <ul>
        {sampleItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App
