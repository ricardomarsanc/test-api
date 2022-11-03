require('dotenv').config()
// DB connection - Auto execute
require('./mongo')

const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const express = require('express')
const app = express()
const cors = require('cors')

const loginRouter = require('./controllers/login')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')

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

app.get('/', (request, response) => {
  console.log(request.ip)
  console.log(request.ips)
  console.log(request.orignalUrl)
  response.send('<h1>Hello World</h1>')
})

// -----------------------------------------------------------------
// CONTROLLERS
// -----------------------------------------------------------------

app.use('/api/notes', notesRouter)
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

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
