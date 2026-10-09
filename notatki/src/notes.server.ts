import type { Note } from './notes.ts'

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Pierwsza notatka',
    body: 'Ta lista żyje w pamięci serwera.',
  },
  {
    id: '2',
    title: 'Druga notatka',
    body: 'Po restarcie serwera wraca do stanu początkowego.',
  },
]

let notes: Note[] = [...sampleNotes]

export function resetNotes() {
  notes = [...sampleNotes]
}

export function listNotes() {
  return notes
}

export function findNote(id: string) {
  return notes.find((note) => note.id === id)
}
