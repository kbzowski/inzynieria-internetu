import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { findNote, insertNote, listNotes } from './notes.server.ts'
import { parseNewNote } from './notes.ts'

export const getNotes = createServerFn({ method: 'GET' })
  .validator((query: string) => (typeof query === 'string' ? query : ''))
  .handler(async ({ data }) => {
    return listNotes(data)
  })

export const getNote = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const note = findNote(data)
    if (!note) {
      throw notFound()
    }
    return note
  })

export const addNote = createServerFn({ method: 'POST' })
  .validator(parseNewNote)
  .handler(async ({ data }) => {
    return insertNote(data)
  })
