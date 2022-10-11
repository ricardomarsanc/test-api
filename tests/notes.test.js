const mongoose = require('mongoose')

const { server } = require('../index')
const Note = require('../models/Note')

const {
  initialNotes,
  api,
  getAllContentsFromNotes,
  getAllNotes
} = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany({})

  // Parallel
  const notesObjects = initialNotes.map(note => new Note(note))
  const promises = notesObjects.map(note => note.save())
  await Promise.all(promises)

  // Sequential
  // for(const note of initialNotes){
  //   const noteObject = new Note(note)
  //   await noteObject.save()
  // }
})

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await getAllNotes()
  expect(response.body).toHaveLength(initialNotes.length)
})

test('add valid new note', async () => {
  const newNote = {
    content: 'Proximamente async/await',
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { contents } = await getAllContentsFromNotes()

  expect(contents).toContain(newNote.content)
})

test('add note without content', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const response = await getAllNotes()

  expect(response.body).toHaveLength(initialNotes.length)
})

test('add note without importance', async () => {
  const newNoteContent = 'Hello without importance'
  const newNote = {
    content: newNoteContent
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await getAllNotes()
  const newNoteObj = response.body.find(note => note.content === newNoteContent)

  expect(newNoteObj.important).toBeFalsy()
})

test('a note can be deleted', async () => {
  const initialResponse = await getAllNotes()
  const { body: notesInitial } = initialResponse
  const [noteToDelete] = notesInitial // Get first element of the array

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const response = await getAllNotes()
  const finalNotes = response.body

  expect(finalNotes).toHaveLength(notesInitial.length - 1)
  expect(finalNotes.find(note => note.id === noteToDelete.id)).toBeUndefined()
})

test('a note with an invalid ID cannot be deleted', async () => {
  const invalidObjectIdThatDoNotExist = '1234'
  await api
    .delete(`/api/notes/${invalidObjectIdThatDoNotExist}`)
    .expect(400)

  const response = await getAllNotes()
  const { body: finalNotes } = response

  expect(finalNotes).toHaveLength(initialNotes.length)
})

test('a note with a valid Id that does not exist cannot be deleted', async () => {
  const validObjectIdThatDoNotExist = '60451827152dc22ad768f442'
  await api
    .delete(`/api/notes/${validObjectIdThatDoNotExist}`)
    .expect(404)

  const response = await getAllNotes()
  const { body: finalNotes } = response

  expect(finalNotes).toHaveLength(initialNotes.length)
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
