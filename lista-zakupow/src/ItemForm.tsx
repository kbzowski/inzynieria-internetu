import { useForm } from '@tanstack/react-form'
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

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    form.handleSubmit()
  }

  // errors[0]?.message daje undefined, gdy errors[0] nie istnieje (zamiast bledu)
  return (
    <form onSubmit={handleSubmit}>
      <form.Field name="name">
        {(field) => (
          <>
            <input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              placeholder="Co kupić?"
              aria-label="Nazwa produktu"
            />
            <button type="submit">Dodaj</button>
            {field.state.meta.errors.length > 0 && (
              <p role="alert">{field.state.meta.errors[0]?.message}</p>
            )}
          </>
        )}
      </form.Field>
    </form>
  )
}

export default ItemForm
