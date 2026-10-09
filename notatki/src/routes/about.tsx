import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <>
      <h1>O aplikacji</h1>
      <p>
        Przykład TanStack Start: routing oparty na plikach i funkcje serwerowe.
      </p>
    </>
  )
}
