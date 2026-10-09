import { useState } from 'react'

type CounterProps = {
  label: string
  step: number
}

function Counter({ label, step }: CounterProps) {
  const [value, setValue] = useState(0)

  return (
    <section className="counter">
      <h2>{label}</h2>
      <p>{value}</p>
      <button onClick={() => setValue(value - step)} disabled={value < step}>
        -{step}
      </button>
      <button onClick={() => setValue(0)}>Zeruj</button>
      <button onClick={() => setValue(value + step)}>+{step}</button>
    </section>
  )
}

export default Counter
