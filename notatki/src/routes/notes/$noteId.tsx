import { Link, createFileRoute } from '@tanstack/react-router'
import { getNote } from '../../notes.functions.ts'

export const Route = createFileRoute('/notes/$noteId')({
  loader: ({ params }) => getNote({ data: params.noteId }),
  component: NoteDetails,
  notFoundComponent: NoteMissing,
})

function NoteDetails() {
  const note = Route.useLoaderData()

  return (
    <>
      <h1>{note.title}</h1>
      <p className="note-body">{note.body}</p>
      <Link to="/notes">Wróć do listy</Link>
    </>
  )
}

function NoteMissing() {
  return (
    <>
      <h1>Nie ma takiej notatki</h1>
      <Link to="/notes">Wróć do listy</Link>
    </>
  )
}
