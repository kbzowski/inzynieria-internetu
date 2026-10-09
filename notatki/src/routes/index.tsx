import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <h1>Start</h1>
      <p>Aplikacja do notatek.</p>
    </>
  )
}
