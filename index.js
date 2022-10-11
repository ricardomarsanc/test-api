require('dotenv').config()
// DB connection - Auto execute
require('./mongo')

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note')

const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleError.js')

app.use(cors())
app.use(express.json())
app.use('/images', express.static('images'))

Sentry.init({
  dsn: process.env.SENTRY_URI,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// app.use(logger)

app.get('/', (request, response) => {
  console.log(request.ip)
  console.log(request.ips)
  console.log(request.orignalUrl)
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findById(id).then(note => {
    if (note) { response.json(note) }
    response.status(404).end()
  }).catch(err => next(err))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(note => {
      response.json(note)
    })
    .catch(next)
})

app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    const res = await Note.findByIdAndDelete(id)
    if (res === null) return response.sendStatus(404)
    response.status(204).end()
  } catch (e) {
    next(e)
  }
})

app.post('/api/notes', async (request, response, next) => {
  const {
    content,
    important = false
  } = request.body

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content,
    date: new Date().toISOString(),
    important
  })

  try {
    const savedNote = await newNote.save()
    response.json(savedNote)
  } catch (e) {
    next(e)
  }
})

// -----------------------------------------------------------------
// MIDDLEWARES
// -----------------------------------------------------------------

// 404 middleware
app.use(notFound)

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

// Fallback Error middleware
app.use(handleErrors)

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
