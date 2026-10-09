import { Link, createFileRoute } from '@tanstack/react-router'
import { getNotes } from '../../notes.functions.ts'

export const Route = createFileRoute('/notes/')({
  loader: () => getNotes(),
  component: Notes,
})

function Notes() {
  const notes = Route.useLoaderData()

  return (
    <>
      <h1>Notatki</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <Link to="/notes/$noteId" params={{ noteId: note.id }}>
              {note.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
