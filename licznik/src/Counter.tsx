type CounterProps = {
  label: string
  step: number
}

function Counter({ label, step }: CounterProps) {
  return (
    <section className="counter">
      <h2>{label}</h2>
      <p>0</p>
      <button>-{step}</button>
      <button>Zeruj</button>
      <button>+{step}</button>
    </section>
  )
}

export default Counter
