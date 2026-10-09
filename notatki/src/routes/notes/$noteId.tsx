import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notes/$noteId')({
  component: NoteDetails,
})

function NoteDetails() {
  const { noteId } = Route.useParams()

  return (
    <>
      <h1>Notatka {noteId}</h1>
      <Link to="/notes">Wróć do listy</Link>
    </>
  )
}
