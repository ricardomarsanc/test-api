const userExtractor = require('../middleware/userExtractor.js')

const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1
  })
  res.json(notes)
})

notesRouter.get('/:id', (req, res, next) => {
  const { id } = req.params

  Note.findById(id).then(note => {
    if (note) { res.json(note) }
    res.status(404).end()
  }).catch(err => next(err))
})

notesRouter.put('/:id', userExtractor, (req, res, next) => {
  const { id } = req.params
  const note = req.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(note => {
      res.json(note)
    })
    .catch(next)
})

notesRouter.delete('/api/notes/:id', userExtractor, async (req, res, next) => {
  const { id } = req.params

  try {
    const res = await Note.findByIdAndDelete(id)
    if (res === null) return res.sendStatus(404)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

notesRouter.post('/', userExtractor, async (req, res, next) => {
  const {
    content,
    important = false
  } = req.body

  const { userId } = req
  const user = await User.findById(userId)

  if (!content) {
    return res.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content,
    date: new Date().toISOString(),
    important,
    user: user._id
  })

  try {
    const savedNote = await newNote.save()
    // Add the new note to the user note list
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    res.json(savedNote)
  } catch (e) {
    next(e)
  }
})

module.exports = notesRouter
