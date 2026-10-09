import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Notatki' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: import.meta.env.DEV
      ? [{ type: 'module', src: '/@vite-plugin-checker-runtime-entry' }]
      : [],
  }),
  shellComponent: RootDocument,
  notFoundComponent: PageMissing,
})

type RootDocumentProps = {
  children: ReactNode
}

function RootDocument({ children }: RootDocumentProps) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
      </head>
      <body>
        <nav>
          <Link to="/" activeOptions={{ exact: true }}>
            Start
          </Link>
          <Link to="/notes">Notatki</Link>
          <Link to="/about">O aplikacji</Link>
        </nav>
        <main>{children}</main>
        <Scripts />
      </body>
    </html>
  )
}

function PageMissing() {
  return (
    <>
      <h1>Nie ma takiej strony</h1>
      <Link to="/">Wróć na start</Link>
    </>
  )
}
