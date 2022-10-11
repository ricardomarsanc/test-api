const { app } = require('../index')
const supertest = require('supertest')

const api = supertest(app)

const initialNotes = [
  {
    content: 'Hola mundo',
    important: true,
    date: new Date()
  },
  {
    content: 'Hola mundo 2',
    important: false,
    date: new Date()
  }
]

const getAllNotes = async () => {
  return await api.get('/api/notes')
}

const getAllContentsFromNotes = async () => {
  const response = await getAllNotes()
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

module.exports = {
  initialNotes,
  getAllContentsFromNotes,
  getAllNotes,
  api
}
