const testingRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')

testingRouter.post('/reset', async (req, res, next) => {
  await Note.deleteMany({})
  await User.deleteMany({})

  res.status(204).end()
})

module.exports = testingRouter
