import { useState, type SubmitEvent } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { addNote, getNotes } from '../../notes.functions.ts'

type NotesSearch = {
  q?: string
}

export const Route = createFileRoute('/notes/')({
  validateSearch: (search: Record<string, unknown>): NotesSearch => {
    const q = typeof search.q === 'string' ? search.q.trim() : ''
    return { q: q === '' ? undefined : q }
  },
  loaderDeps: ({ search }) => ({ q: search.q ?? '' }),
  loader: ({ deps }) => getNotes({ data: deps.q }),
  component: Notes,
})

function Notes() {
  const notes = Route.useLoaderData()
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const addNoteFn = useServerFn(addNote)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = new FormData(event.currentTarget).get('q')
    navigate({ search: { q: typeof text === 'string' ? text : undefined } })
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await addNoteFn({ data: { title, body } })
      setError('')
      setTitle('')
      setBody('')
      await navigate({ search: {} })
      await router.invalidate({ sync: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Nie udało się dodać notatki',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h1>Notatki</h1>
      <form onSubmit={handleSearch}>
        <input
          key={q}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Szukaj"
          aria-label="Szukaj"
        />
        <button type="submit">Szukaj</button>
      </form>
      {notes.length === 0 ? (
        <p>Brak pasujących notatek.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <Link to="/notes/$noteId" params={{ noteId: note.id }}>
                {note.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Tytuł"
          aria-label="Tytuł"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Treść"
          aria-label="Treść"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Dodawanie...' : 'Dodaj'}
        </button>
        {error !== '' && <p role="alert">{error}</p>}
      </form>
    </>
  )
}
