export type Note = {
  id: string
  title: string
  body: string
}

export type NewNote = {
  title: string
  body: string
}

export function parseNewNote(input: NewNote) {
  if (typeof input?.title !== 'string' || typeof input?.body !== 'string') {
    throw new Error('Niepoprawne dane notatki')
  }
  const title = input.title.trim()
  const body = input.body.trim()
  if (title === '') {
    throw new Error('Tytuł jest wymagany')
  }
  if (title.length > 100) {
    throw new Error('Tytuł może mieć najwyżej 100 znaków')
  }
  if (body.length > 2000) {
    throw new Error('Treść może mieć najwyżej 2000 znaków')
  }
  return { title, body }
}
