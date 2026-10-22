import { useField, useForm } from '@tanstack/react-form'
import type { SubmitEvent } from 'react'
import { newItemSchema } from './types.ts'

type ItemFormProps = {
  onAdd: (name: string) => void
}

function ItemForm({ onAdd }: ItemFormProps) {
  const form = useForm({
    defaultValues: { name: '' },
    validators: { onChange: newItemSchema },
    onSubmit: ({ value }) => {
      // walidator sprawdza dane, ale ich nie zmienia, wiec trim jeszcze raz
      onAdd(value.name.trim())
      form.reset()
    },
  })
  const nameField = useField({ form, name: 'name' })

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    form.handleSubmit()
  }

  // errors[0]?.message daje undefined, gdy errors[0] nie istnieje (zamiast bledu)
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nameField.state.value}
        onChange={(event) => nameField.handleChange(event.target.value)}
        placeholder="Co kupić?"
        aria-label="Nazwa produktu"
      />
      <button type="submit">Dodaj</button>
      {nameField.state.meta.errors.length > 0 && (
        <p role="alert">{nameField.state.meta.errors[0]?.message}</p>
      )}
    </form>
  )
}

export default ItemForm
