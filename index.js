const express = require('express')
const cors = require('cors')

const logger = require('./loggerMiddleware')

const app = express()

app.use(cors())
app.use(express.json())

app.use(logger)

let notes = [
  {
    id: 1,
    content: 'Estudia por favor',
    date: '2022-05-30T18:39:34.091Z',
    important: false
  },
  {
    id: 2,
    content: 'Estudia por favor 2',
    date: '2022-09-20T10:39:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'Estudia por favor 3',
    date: '2022-07-30T07:30:34.091Z',
    important: true
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  if (note) { response.json(note) }

  response.status(404).end()
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  const noteIds = notes.map(note => note.id)
  const maxId = Math.max(...noteIds)

  const newNote = {
    id: maxId + 1,
    date: new Date().toISOString(),
    important: note.important ?? false,
    content: note.content
  }

  notes.push(newNote)

  response.status(201).json(newNote)
})

app.use((request, response) => {
  response.status(404).json({
    error: 'Not found'
  })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
