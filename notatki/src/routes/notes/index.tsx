import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notes/')({
  component: Notes,
})

function Notes() {
  return (
    <>
      <h1>Notatki</h1>
      <ul>
        <li>
          <Link to="/notes/$noteId" params={{ noteId: '1' }}>
            Pierwsza notatka
          </Link>
        </li>
        <li>
          <Link to="/notes/$noteId" params={{ noteId: '2' }}>
            Druga notatka
          </Link>
        </li>
      </ul>
    </>
  )
}
