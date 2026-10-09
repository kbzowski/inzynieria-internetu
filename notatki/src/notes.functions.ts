import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { findNote, listNotes } from './notes.server.ts'

export const getNotes = createServerFn({ method: 'GET' }).handler(async () => {
  return listNotes()
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
