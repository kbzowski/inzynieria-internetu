import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({ method: 'GET' }).handler(async () => {
  return new Date().toLocaleTimeString('pl-PL')
})

export const Route = createFileRoute('/')({
  loader: () => getServerTime(),
  component: Home,
})

function Home() {
  const time = Route.useLoaderData()
  const router = useRouter()

  return (
    <>
      <h1>Start</h1>
      <p>Godzina na serwerze: {time}</p>
      <button onClick={() => router.invalidate()}>Odśwież</button>
    </>
  )
}
