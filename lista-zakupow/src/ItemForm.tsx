import { useState, type SubmitEvent } from 'react'

type ItemFormProps = {
  onAdd: (name: string) => void
}

function ItemForm({ onAdd }: ItemFormProps) {
  const [name, setName] = useState('')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed === '') {
      return
    }
    onAdd(trimmed)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Co kupić?"
        aria-label="Nazwa produktu"
      />
      <button type="submit">Dodaj</button>
    </form>
  )
}

export default ItemForm
