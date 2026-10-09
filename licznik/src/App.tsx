import Counter from './Counter.tsx'

function App() {
  return (
    <main>
      <h1>Liczniki</h1>
      <Counter label="Kroki" step={1} />
      <Counter label="Punkty" step={10} />
    </main>
  )
}

export default App
